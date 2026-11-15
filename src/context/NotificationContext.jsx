import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket } from '../services/socket';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('og_notifications');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'welcome-offer',
        title: '🔥 10% Flat Instant Off',
        message: 'Use coupon code OG10 at checkout on authentic supplements.',
        type: 'offer',
        time: new Date().toISOString(),
        read: false
      },
      {
        id: 'genuine-guarantee',
        title: '🛡️ 100% Genuine Lab Tested',
        message: 'All supplement batches shipped with original holographic importer seals.',
        type: 'info',
        time: new Date().toISOString(),
        read: true
      }
    ];
  });

  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('og_notifications', JSON.stringify(notifications));
    } catch (e) {}
    setHasUnread(notifications.some(n => !n.read));
  }, [notifications]);

  const addNotification = (notif) => {
    const newNotif = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      time: new Date().toISOString(),
      read: false,
      ...notif
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 19)]); // Keep last 20
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Real-time socket events for orders & announcements
  useEffect(() => {
    // 1. Order Placed / Created
    const handleOrderCreated = (order) => {
      // If logged in customer matches or guest matching recent order
      const myId = user ? (user._id || user.id) : null;
      const myEmail = user ? user.email?.toLowerCase() : null;
      const orderEmail = order.email?.toLowerCase();
      const orderUserId = order.userId;

      const isMyOrder = (myId && orderUserId === myId) || (myEmail && orderEmail === myEmail);

      if (isMyOrder || !user) {
        addNotification({
          title: `📦 Order Confirmed: ${order.orderId}`,
          message: `Your order for ₹${Number(order.totalAmount || 0).toLocaleString('en-IN')} has been placed successfully!`,
          type: 'order',
          orderId: order.orderId
        });
      }
    };

    // 2. Order Status Update (Shipped, Out for Delivery, Delivered)
    const handleStatusUpdated = (data) => {
      let icon = '🚚';
      let title = `Order Status: ${data.orderStatus}`;

      if (data.orderStatus === 'Shipped') {
        icon = '📦';
        title = `Order Shipped (${data.orderId})`;
      } else if (data.orderStatus === 'Out for Delivery') {
        icon = '🛵';
        title = `Out for Delivery (${data.orderId})`;
      } else if (data.orderStatus === 'Delivered') {
        icon = '🎉';
        title = `Order Delivered (${data.orderId})`;
      } else if (data.orderStatus === 'Cancelled') {
        icon = '❌';
        title = `Order Cancelled (${data.orderId})`;
      }

      addNotification({
        title: `${icon} ${title}`,
        message: `Your order ${data.orderId} is now ${data.orderStatus}.`,
        type: 'order',
        orderId: data.orderId
      });
    };

    // 3. New Offer / Product announcement
    const handleProductCreated = (prod) => {
      addNotification({
        title: `✨ New Arrival: ${prod.name}`,
        message: `Now in stock: ${prod.brand || 'OG-Nutrition'} at ₹${Number(prod.discountPrice || prod.price).toLocaleString('en-IN')}`,
        type: 'offer',
        productId: prod._id || prod.id
      });
    };

    socket.on('order:created', handleOrderCreated);
    socket.on('order:statusUpdated', handleStatusUpdated);
    socket.on('product:created', handleProductCreated);

    return () => {
      socket.off('order:created', handleOrderCreated);
      socket.off('order:statusUpdated', handleStatusUpdated);
      socket.off('product:created', handleProductCreated);
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      hasUnread,
      addNotification,
      markAllAsRead,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
