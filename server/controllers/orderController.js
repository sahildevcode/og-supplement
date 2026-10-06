import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { PaymentSettings } from '../models/PaymentSettings.js';

const getIO = (req) => req.app.get('io');

// Resilient product finder by ID, name, or partial search
const findProductInDB = async (item) => {
  let prod = null;
  if (item.productId) {
    try {
      prod = await Product.findById(item.productId);
    } catch (e) {}
  }
  if (!prod && item.name) {
    try {
      prod = await Product.findOne({ name: item.name });
    } catch (e) {}
  }
  if (!prod && item.name) {
    try {
      const allProds = await Product.find();
      prod = allProds.find(p =>
        p.name.toLowerCase().trim() === item.name.toLowerCase().trim() ||
        p.name.toLowerCase().includes(item.name.toLowerCase()) ||
        item.name.toLowerCase().includes(p.name.toLowerCase())
      );
    } catch (e) {}
  }
  return prod;
};

// Robust Order Identifier Matcher (_id, id, orderId)
const matchesOrderId = (o, targetId) => {
  if (!o || !targetId) return false;
  const target = String(targetId).trim().toLowerCase();
  const idStr = String(o._id || o.id || '').trim().toLowerCase();
  const orderIdStr = String(o.orderId || '').trim().toLowerCase();
  return idStr === target || orderIdStr === target;
};

// @route   POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      landmark = '',
      products,
      paymentMethod = 'Cash on Delivery',
      transactionId = ''
    } = req.body;

    if (!customerName || !email || !phone || !address || !city || !state || !pincode || !products || !products.length) {
      return res.status(400).json({ success: false, message: 'Please provide all necessary order and shipping details' });
    }

    // 1. Calculate subtotal & prepare sanitized product list
    let subtotal = 0;
    const sanitizedProducts = [];
    const io = getIO(req);

    for (const item of products) {
      const dbProduct = await findProductInDB(item);
      const itemPrice = dbProduct
        ? Number(dbProduct.discountPrice || dbProduct.price)
        : Number(item.price || 0);

      subtotal += itemPrice * Number(item.quantity || 1);

      sanitizedProducts.push({
        productId: dbProduct ? (dbProduct._id || dbProduct.id) : (item.productId || 'prod_custom'),
        name: dbProduct ? dbProduct.name : item.name,
        brand: dbProduct ? dbProduct.brand : (item.brand || 'OG-Nutrition'),
        image: (dbProduct && dbProduct.images && dbProduct.images[0]) || item.image || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80',
        price: itemPrice,
        quantity: Number(item.quantity || 1),
        variant: item.variant || 'Standard',
        flavour: item.flavour || 'Standard',
        shippingCost: dbProduct ? Number(dbProduct.shippingCost || 0) : Number(item.shippingCost || 0),
        isGstApplicable: dbProduct && dbProduct.isGstApplicable !== undefined ? dbProduct.isGstApplicable : true,
        gstRate: dbProduct ? Number(dbProduct.gstRate || 18) : 18,
        isCancellationFeeApplicable: dbProduct?.isCancellationFeeApplicable !== undefined ? dbProduct.isCancellationFeeApplicable : true,
        cancellationFeeType: dbProduct?.cancellationFeeType || 'percentage',
        cancellationFeeValue: dbProduct?.cancellationFeeValue !== undefined ? Number(dbProduct.cancellationFeeValue) : 5
      });

      // Deduct stock if product exists in DB
      if (dbProduct) {
        const newStock = Math.max(0, dbProduct.stock - Number(item.quantity || 1));
        const newSalesCount = (Number(dbProduct.salesCount) || 0) + Number(item.quantity || 1);
        const updatedProduct = await Product.findByIdAndUpdate(
          dbProduct._id || dbProduct.id,
          { stock: newStock, salesCount: newSalesCount },
          { new: true }
        );

        if (io && updatedProduct) {
          io.emit('product:stockUpdated', {
            productId: updatedProduct._id || updatedProduct.id,
            stock: updatedProduct.stock,
            status: updatedProduct.status,
            lowStockThreshold: updatedProduct.lowStockThreshold
          });
          io.emit('product:updated', updatedProduct);
        }
      }
    }

    const calculatedShipping = sanitizedProducts.reduce((max, p) => Math.max(max, Number(p.shippingCost || 0)), 0);
    const shipping = req.body.shipping !== undefined ? Number(req.body.shipping) : calculatedShipping;
    const discount = req.body.discount !== undefined ? Number(req.body.discount) : (subtotal > 2000 ? Math.round(subtotal * 0.05) : 0);
    const calculatedTax = sanitizedProducts.reduce((sum, p) => {
      if (p.isGstApplicable !== false) {
        const rate = Number(p.gstRate !== undefined ? p.gstRate : 18);
        return sum + Math.round((Number(p.price || 0) * Number(p.quantity || 1) * rate) / 100);
      }
      return sum;
    }, 0);
    const tax = req.body.tax !== undefined ? Number(req.body.tax) : calculatedTax;
    const totalAmount = req.body.totalAmount ? Number(req.body.totalAmount) : (subtotal - discount + shipping + tax);

    // 2. Save Order to Database
    const userId = req.user ? (req.user._id || req.user.id) : (req.body.userId || 'guest');
    const newOrder = await Order.create({
      userId,
      customerName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      landmark,
      products: sanitizedProducts,
      subtotal,
      discount,
      shipping,
      tax,
      totalAmount,
      paymentMethod,
      paymentStatus: req.body.paymentStatus || (paymentMethod === 'Razorpay (Online)' ? 'Paid' : (paymentMethod === 'Online / UPI' ? 'Verification Pending' : 'Pending')),
      transactionId: transactionId || req.body.razorpayPaymentId || '',
      orderStatus: 'Order Placed'
    });

    // 3. Emit real-time order creation event to connected Admin Panels
    if (io) {
      io.emit('order:created', newOrder);
      console.log(`\x1b[35m[Socket.IO Broadcast]\x1b[0m order:created => Order ID: ${newOrder.orderId} (₹${newOrder.totalAmount})`);
    }

    res.status(201).json({
      success: true,
      order: newOrder,
      message: 'Order placed successfully!'
    });
  } catch (error) {
    console.error('[Create Order Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/orders/my-orders
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const email = req.user ? req.user.email : req.query.email;

    const allOrders = await Order.find();
    
    if (!userId && !email) {
      return res.json({ success: true, count: allOrders.length, orders: allOrders });
    }

    const userOrders = allOrders.filter(o =>
      (userId && o.userId === userId) ||
      (email && o.email?.toLowerCase() === email.toLowerCase())
    );

    res.json({ success: true, count: userOrders.length, orders: userOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const allOrders = await Order.find();
    const order = allOrders.find(o => matchesOrderId(o, req.params.id));
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PATCH /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const validStatuses = [
      'Order Placed',
      'Packed',
      'Processing',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const allOrders = await Order.find();
    const existingOrder = allOrders.find(o => matchesOrderId(o, req.params.id));

    if (!existingOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const targetId = existingOrder._id || existingOrder.id;

    // If order is newly cancelled, restore stock
    if (status === 'Cancelled' && existingOrder.orderStatus !== 'Cancelled') {
      const io = getIO(req);
      for (const item of existingOrder.products) {
        const dbProduct = await findProductInDB(item);
        if (dbProduct) {
          const restored = await Product.findByIdAndUpdate(
            dbProduct._id || dbProduct.id,
            { stock: dbProduct.stock + item.quantity }
          );
          if (io && restored) {
            io.emit('product:stockUpdated', {
              productId: restored._id || restored.id,
              stock: restored.stock,
              status: restored.status
            });
            io.emit('product:updated', restored);
          }
        }
      }
    }

    const updated = await Order.findByIdAndUpdate(targetId, { orderStatus: status }, { new: true });

    // Emit real-time status update to connected customer & admin clients
    const io = getIO(req);
    if (io && updated) {
      io.emit('order:statusUpdated', {
        orderId: updated.orderId,
        _id: updated._id || updated.id,
        orderStatus: updated.orderStatus,
        updatedAt: updated.updatedAt
      });
      console.log(`\x1b[35m[Socket.IO Broadcast]\x1b[0m order:statusUpdated => Order ${updated.orderId} is now "${updated.orderStatus}"`);
    }

    res.json({ success: true, order: updated, message: `Order status updated to ${status}` });
  } catch (error) {
    console.error('[Update Order Status Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/orders/:id/refund
export const refundOrder = async (req, res) => {
  try {
    const allOrders = await Order.find();
    const existingOrder = allOrders.find(o => matchesOrderId(o, req.params.id));

    if (!existingOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (existingOrder.paymentStatus === 'Refunded' || existingOrder.orderStatus === 'Refunded') {
      return res.status(400).json({ success: false, message: 'This order has already been refunded' });
    }

    const paymentId = existingOrder.transactionId || existingOrder.razorpayPaymentId;
    const isRazorpay = existingOrder.paymentMethod === 'Razorpay (Online)' || (paymentId && paymentId.startsWith('pay_'));

    let refundData = null;

    if (isRazorpay && paymentId && paymentId.startsWith('pay_')) {
      const settings = await PaymentSettings.get();
      const keyId = settings.razorpayKeyId || process.env.RAZORPAY_KEY_ID;
      const keySecret = settings.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        return res.status(500).json({ success: false, message: 'Razorpay API credentials not configured in settings' });
      }

      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const refundAmountPaise = Math.round(Number(existingOrder.totalAmount) * 100);

      const rzpResponse = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          amount: refundAmountPaise,
          notes: {
            orderId: existingOrder.orderId,
            reason: req.body.reason || 'Admin initiated refund from portal'
          }
        })
      });

      refundData = await rzpResponse.json();

      if (!rzpResponse.ok) {
        console.error('[Razorpay Refund Error]', refundData);
        return res.status(rzpResponse.status || 400).json({
          success: false,
          message: refundData.error?.description || 'Razorpay refund failed',
          error: refundData
        });
      }
    } else {
      // Manual / COD / simulated refund
      refundData = {
        id: `rfnd_manual_${Date.now().toString(36)}`,
        amount: Math.round(Number(existingOrder.totalAmount) * 100),
        status: 'processed'
      };
    }

    const targetId = existingOrder._id || existingOrder.id;

    // Restore stock if not already cancelled
    if (existingOrder.orderStatus !== 'Cancelled' && existingOrder.orderStatus !== 'Refunded') {
      const io = getIO(req);
      for (const item of existingOrder.products) {
        const dbProduct = await findProductInDB(item);
        if (dbProduct) {
          const restored = await Product.findByIdAndUpdate(
            dbProduct._id || dbProduct.id,
            { stock: dbProduct.stock + item.quantity }
          );
          if (io && restored) {
            io.emit('product:stockUpdated', {
              productId: restored._id || restored.id,
              stock: restored.stock,
              status: restored.status
            });
            io.emit('product:updated', restored);
          }
        }
      }
    }

    const updated = await Order.findByIdAndUpdate(targetId, {
      paymentStatus: 'Refunded',
      orderStatus: 'Refunded',
      refundId: refundData.id || '',
      refundAmount: refundData.amount ? (refundData.amount / 100) : existingOrder.totalAmount,
      refundStatus: refundData.status || 'processed'
    }, { new: true });

    const io = getIO(req);
    if (io && updated) {
      io.emit('order:statusUpdated', {
        orderId: updated.orderId,
        _id: updated._id || updated.id,
        orderStatus: updated.orderStatus,
        paymentStatus: updated.paymentStatus,
        refundId: updated.refundId,
        updatedAt: updated.updatedAt
      });
      io.emit('order:refunded', updated);
      console.log(`\x1b[35m[Socket.IO Broadcast]\x1b[0m order:refunded => Order ${updated.orderId} (₹${updated.totalAmount}) Refund ID: ${updated.refundId}`);
    }

    res.json({
      success: true,
      message: `Refund of ₹${existingOrder.totalAmount} processed successfully!`,
      refund: refundData,
      order: updated
    });
  } catch (error) {
    console.error('[Refund Order Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const calculateCancellationBreakdown = async (order) => {
  const isCOD = order.paymentMethod === 'Cash on Delivery';
  const isPaid = !isCOD && (order.paymentStatus === 'Paid' || (order.paymentMethod === 'Razorpay (Online)' && order.transactionId));
  const totalAmount = Number(order.totalAmount || 0);

  if (!isPaid) {
    return {
      isPaid: false,
      totalAmount,
      cancellationFee: 0,
      refundAmount: 0,
      breakdown: []
    };
  }

  let totalFee = 0;
  const breakdown = [];

  for (const item of (order.products || [])) {
    const itemPrice = Number(item.price || 0);
    const qty = Number(item.quantity || 1);
    const itemTotal = itemPrice * qty;

    // Check latest product settings from DB, fallback to order item
    const dbProduct = await findProductInDB(item);
    const isApplicable = dbProduct?.isCancellationFeeApplicable !== undefined
      ? dbProduct.isCancellationFeeApplicable
      : (item.isCancellationFeeApplicable !== false);

    const feeType = dbProduct?.cancellationFeeType || item.cancellationFeeType || 'percentage';
    const feeVal = dbProduct?.cancellationFeeValue !== undefined
      ? Number(dbProduct.cancellationFeeValue)
      : (item.cancellationFeeValue !== undefined ? Number(item.cancellationFeeValue) : 5);

    let itemFee = 0;
    if (isApplicable !== false) {
      if (feeType === 'percentage') {
        itemFee = Math.round((itemTotal * feeVal) / 100);
      } else {
        // Flat fee per item (e.g. ₹50 or ₹5)
        itemFee = Math.round(feeVal * qty);
      }
    }
    totalFee += itemFee;
    breakdown.push({
      name: item.name,
      itemTotal,
      fee: itemFee,
      feeType,
      feeValue: feeVal
    });
  }

  // Ensure cancellation fee does not exceed total amount, and minimum fee is 0
  totalFee = Math.min(totalAmount, Math.max(0, totalFee));
  const refundAmount = Math.max(0, totalAmount - totalFee);

  return {
    isPaid: true,
    totalAmount,
    cancellationFee: totalFee,
    refundAmount,
    breakdown
  };
};

// @route   GET /api/orders/:id/cancel-preview
export const getCancellationPreview = async (req, res) => {
  try {
    const allOrders = await Order.find();
    const order = allOrders.find(o => matchesOrderId(o, req.params.id));

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const preview = await calculateCancellationBreakdown(order);
    res.json({
      success: true,
      orderId: order.orderId,
      orderStatus: order.orderStatus,
      paymentMethod: order.paymentMethod,
      ...preview
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/orders/:id/cancel
export const cancelOrder = async (req, res) => {
  try {
    const allOrders = await Order.find();
    const order = allOrders.find(o => matchesOrderId(o, req.params.id));

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.orderStatus === 'Cancelled' || order.orderStatus === 'Refunded') {
      return res.status(400).json({ success: false, message: 'This order is already cancelled' });
    }

    if (['Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Order has already been dispatched and cannot be cancelled online' });
    }

    const { reason = 'Customer requested cancellation' } = req.body;
    const breakdown = await calculateCancellationBreakdown(order);

    let refundData = null;
    const paymentId = order.transactionId || order.razorpayPaymentId;
    const isRazorpay = order.paymentMethod === 'Razorpay (Online)' || (paymentId && paymentId.startsWith('pay_'));

    if (breakdown.isPaid && breakdown.refundAmount > 0 && isRazorpay && paymentId && paymentId.startsWith('pay_')) {
      const settings = await PaymentSettings.get();
      const keyId = settings.razorpayKeyId || process.env.RAZORPAY_KEY_ID;
      const keySecret = settings.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;

      if (keyId && keySecret) {
        try {
          const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
          const refundPaise = Math.round(breakdown.refundAmount * 100);

          const rzpResponse = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authHeader
            },
            body: JSON.stringify({
              amount: refundPaise,
              notes: {
                orderId: order.orderId,
                totalPaid: order.totalAmount,
                cancellationFee: breakdown.cancellationFee,
                reason
              }
            })
          });

          refundData = await rzpResponse.json();
          if (!rzpResponse.ok) {
            console.warn('[Auto-Refund Notice] Razorpay refund failed:', refundData);
          }
        } catch (rzpErr) {
          console.error('[Auto-Refund Error]', rzpErr);
        }
      }
    }

    // Restore inventory stock
    const io = getIO(req);
    for (const item of (order.products || [])) {
      const dbProduct = await findProductInDB(item);
      if (dbProduct) {
        const restored = await Product.findByIdAndUpdate(
          dbProduct._id || dbProduct.id,
          { stock: dbProduct.stock + item.quantity }
        );
        if (io && restored) {
          io.emit('product:stockUpdated', {
            productId: restored._id || restored.id,
            stock: restored.stock,
            status: restored.status
          });
          io.emit('product:updated', restored);
        }
      }
    }

    const targetId = order._id || order.id;
    const initialRefundStatus = breakdown.isPaid ? 'processing' : '';
    const updated = await Order.findByIdAndUpdate(targetId, {
      orderStatus: 'Cancelled',
      paymentStatus: breakdown.isPaid ? 'Refunded' : order.paymentStatus,
      cancellationFee: breakdown.cancellationFee,
      refundAmount: breakdown.refundAmount,
      refundId: refundData?.id || (breakdown.isPaid ? `rfnd_auto_${Date.now().toString(36)}` : ''),
      refundStatus: initialRefundStatus,
      cancelReason: reason,
      cancelledAt: new Date().toISOString()
    }, { new: true });

    if (io && updated) {
      io.emit('order:statusUpdated', {
        orderId: updated.orderId,
        _id: updated._id || updated.id,
        orderStatus: updated.orderStatus,
        paymentStatus: updated.paymentStatus,
        refundId: updated.refundId,
        refundAmount: updated.refundAmount,
        refundStatus: updated.refundStatus,
        cancellationFee: updated.cancellationFee,
        updatedAt: updated.updatedAt
      });
      io.emit('order:cancelled', updated);
    }

    res.json({
      success: true,
      message: breakdown.isPaid
        ? `Order cancelled. ₹${breakdown.refundAmount} refund initiated to your original payment method (Handling fee: ₹${breakdown.cancellationFee}). It usually takes 2 to 4 business days to reflect in your account.`
        : 'Order cancelled successfully.',
      order: updated,
      breakdown,
      refund: refundData
    });
  } catch (error) {
    console.error('[Cancel Order Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PATCH /api/orders/:id/refund-status
export const updateRefundStatus = async (req, res) => {
  try {
    const { refundStatus } = req.body;
    if (!refundStatus) {
      return res.status(400).json({ success: false, message: 'Refund status is required' });
    }

    const allOrders = await Order.find();
    const existingOrder = allOrders.find(o => matchesOrderId(o, req.params.id));

    if (!existingOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const targetId = existingOrder._id || existingOrder.id;
    const updated = await Order.findByIdAndUpdate(targetId, {
      refundStatus,
      paymentStatus: (refundStatus === 'completed' || refundStatus === 'processed') ? 'Refunded' : existingOrder.paymentStatus
    }, { new: true });

    const io = getIO(req);
    if (io && updated) {
      io.emit('order:statusUpdated', {
        orderId: updated.orderId,
        _id: updated._id || updated.id,
        orderStatus: updated.orderStatus,
        paymentStatus: updated.paymentStatus,
        refundStatus: updated.refundStatus,
        refundAmount: updated.refundAmount,
        cancellationFee: updated.cancellationFee,
        updatedAt: updated.updatedAt
      });
      io.emit('order:refundUpdated', updated);
      console.log(`\x1b[35m[Socket.IO Broadcast]\x1b[0m order:refundUpdated => Order ${updated.orderId} refund status: "${updated.refundStatus}"`);
    }

    res.json({
      success: true,
      message: `Refund status updated to ${refundStatus}`,
      order: updated
    });
  } catch (error) {
    console.error('[Update Refund Status Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

