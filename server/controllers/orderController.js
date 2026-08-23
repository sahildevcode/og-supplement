import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

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
        flavour: item.flavour || 'Standard'
      });

      // Deduct stock if product exists in DB
      if (dbProduct) {
        const newStock = Math.max(0, dbProduct.stock - Number(item.quantity || 1));
        const updatedProduct = await Product.findByIdAndUpdate(
          dbProduct._id || dbProduct.id,
          { stock: newStock },
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

    const discount = subtotal > 2000 ? Math.round(subtotal * 0.05) : 0; // 5% bulk discount over 2000
    const shipping = subtotal >= 999 ? 0 : 99; // Free shipping over 999
    const totalAmount = subtotal - discount + shipping;

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
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'Online / UPI' ? 'Paid' : 'Pending',
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
    const order = allOrders.find(o => o._id === req.params.id || o.orderId === req.params.id);
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

    const allOrders = await Order.find();
    const existingOrder = allOrders.find(o => o._id === req.params.id || o.orderId === req.params.id);

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
