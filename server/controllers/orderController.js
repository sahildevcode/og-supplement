import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

const getIO = (req) => req.app.get('io');

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
      paymentMethod = 'Cash on Delivery'
    } = req.body;

    if (!customerName || !email || !phone || !address || !city || !state || !pincode || !products || !products.length) {
      return res.status(400).json({ success: false, message: 'Please provide all necessary order and shipping details' });
    }

    // 1. Validate stock on server for EVERY item
    for (const item of products) {
      const dbProduct = await Product.findById(item.productId);
      if (!dbProduct) {
        return res.status(404).json({ success: false, message: `Product "${item.name}" is no longer available in store.` });
      }
      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: dbProduct.stock === 0
            ? `"${dbProduct.name}" is out of stock.`
            : `Only ${dbProduct.stock} units of "${dbProduct.name}" are currently available in stock.`
        });
      }
    }

    // 2. Calculate subtotal & delivery charges
    let subtotal = 0;
    const sanitizedProducts = [];

    for (const item of products) {
      const dbProduct = await Product.findById(item.productId);
      const itemPrice = Number(dbProduct.discountPrice || dbProduct.price);
      subtotal += itemPrice * Number(item.quantity);

      sanitizedProducts.push({
        productId: dbProduct._id || dbProduct.id,
        name: dbProduct.name,
        brand: dbProduct.brand,
        image: (dbProduct.images && dbProduct.images[0]) || '',
        price: itemPrice,
        quantity: Number(item.quantity),
        variant: item.variant || 'Standard',
        flavour: item.flavour || 'Standard'
      });
    }

    const discount = subtotal > 2000 ? Math.round(subtotal * 0.05) : 0; // 5% bulk discount over 2000
    const shipping = subtotal >= 999 ? 0 : 99; // Free shipping over 999
    const totalAmount = subtotal - discount + shipping;

    // 3. Atomically Deduct stock & emit real-time updates
    const io = getIO(req);
    for (const item of products) {
      const dbProduct = await Product.findById(item.productId);
      const newStock = Math.max(0, dbProduct.stock - Number(item.quantity));
      const updatedProduct = await Product.findByIdAndUpdate(item.productId, { stock: newStock }, { new: true });

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

    // 4. Save Order
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
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'Online / UPI' ? 'Paid' : 'Pending',
      orderStatus: 'Order Placed'
    });

    // 5. Emit real-time order creation event to Admin Panel
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

    if (!userId && !email) {
      return res.status(400).json({ success: false, message: 'User identification required' });
    }

    const allOrders = await Order.find();
    const userOrders = allOrders.filter(o => (userId && o.userId === userId) || (email && o.email?.toLowerCase() === email.toLowerCase()));

    res.json({ success: true, orders: userOrders });
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
    const order = await Order.findById(req.params.id);
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

    const validStatuses = ['Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // If order is newly cancelled, restore stock
    if (status === 'Cancelled' && existingOrder.orderStatus !== 'Cancelled') {
      const io = getIO(req);
      for (const item of existingOrder.products) {
        const dbProduct = await Product.findById(item.productId);
        if (dbProduct) {
          const restored = await Product.findByIdAndUpdate(item.productId, { stock: dbProduct.stock + item.quantity });
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

    const updated = await Order.findByIdAndUpdate(req.params.id, { orderStatus: status }, { new: true });

    // Emit real-time status update to connected customer & admin clients
    const io = getIO(req);
    if (io) {
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
