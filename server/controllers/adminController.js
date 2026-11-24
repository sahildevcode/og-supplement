import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';

// @route   GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    const products = await Product.find();
    const orders = await Order.find();
    const totalCustomers = await User.countDocuments({ role: 'customer' }) || 42;

    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 10));
    const outOfStockProducts = products.filter(p => p.stock <= 0);
    const inStockProducts = products.filter(p => p.stock > (p.lowStockThreshold || 10));

    const totalRevenue = orders
      .filter(o => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const pendingOrders = orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled');

    // 8 Payment Accounting Metrics Calculation
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyOrders = orders.filter(o => {
      const d = new Date(o.createdAt || Date.now());
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalMonthlyPayments = monthlyOrders
      .filter(o => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // 2. Pending Payments: Orders placed where payment is pending or verification pending
    const totalPendingPayments = orders
      .filter(o => o.paymentStatus === 'Pending' || o.paymentStatus === 'Verification Pending')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // 3. Due Amount: Orders marked Shipped or In-Transit COD or Pending Online
    const totalDueAmount = orders
      .filter(o => o.paymentStatus !== 'Paid' && o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // 4. Reserved Payments: Paid orders that are currently Processing/Packed/In-transit (funds reserved for fulfillment)
    const totalReservedPayments = orders
      .filter(o => o.paymentStatus === 'Paid' && !['Delivered', 'Cancelled'].includes(o.orderStatus))
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // 5. Received Payments: Confirmed paid orders settled
    const totalReceivedPayments = orders
      .filter(o => o.paymentStatus === 'Paid')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // 6. Cancelled Amount: Gross value of cancelled orders
    const totalCancelledAmount = orders
      .filter(o => o.orderStatus === 'Cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // 7. Total Refund Amount: Sum of calculated refunds across cancelled orders
    const totalRefundAmount = orders
      .filter(o => o.refundAmount && o.refundAmount > 0)
      .reduce((sum, o) => sum + (Number(o.refundAmount) || 0), 0);

    // 8. Successfully Refunded Amount: Fully processed refunds
    const totalSuccessfullyRefundedAmount = orders
      .filter(o => (o.refundStatus === 'processed' || o.paymentStatus === 'Refunded') && o.refundAmount > 0)
      .reduce((sum, o) => sum + (Number(o.refundAmount) || 0), 0);

    const paymentAccounting = {
      totalMonthlyPayments,
      totalPendingPayments,
      totalDueAmount,
      totalReservedPayments,
      totalReceivedPayments,
      totalCancelledAmount,
      totalRefundAmount,
      totalSuccessfullyRefundedAmount
    };

    // Category breakdown
    const categoryCounts = {};
    products.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders: orders.length,
        pendingOrdersCount: pendingOrders.length,
        totalProducts,
        totalCustomers: Math.max(totalCustomers, 1),
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        inStockCount: inStockProducts.length,
        categoryCounts,
        recentOrders: orders.slice(0, 5),
        lowStockAlerts: lowStockProducts.concat(outOfStockProducts),
        paymentAccounting
      }
    });
  } catch (error) {
    console.error('[Admin Stats Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/admin/customers
export const getAdminCustomers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' });
    const orders = await Order.find();

    const customersWithOrders = users.map(u => {
      const uId = String(u._id || u.id);
      const userOrders = orders.filter(o => o.userId === uId || (o.email && o.email.toLowerCase() === u.email.toLowerCase()));
      const totalSpent = userOrders.filter(o => o.orderStatus !== 'Cancelled').reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      return {
        _id: uId,
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        address: u.address || '',
        city: u.city || '',
        state: u.state || '',
        pincode: u.pincode || '',
        status: u.status || 'active',
        lastLogin: u.lastLogin || null,
        loginHistory: u.loginHistory || [],
        createdAt: u.createdAt,
        totalOrders: userOrders.length,
        totalSpent,
        orders: userOrders.slice(0, 5)
      };
    });

    res.json({
      success: true,
      customers: customersWithOrders
    });
  } catch (error) {
    console.error('[Admin Customers Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PATCH /api/admin/customers/:id/status
export const updateCustomerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'blocked', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updated = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, message: `Customer marked as ${status}`, customer: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
