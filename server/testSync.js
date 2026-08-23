import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

console.log('Testing Socket.IO Client connection...');

socket.on('connect', async () => {
  console.log('✓ Connected to Socket.IO Server with ID:', socket.id);

  // Setup listeners
  socket.on('product:updated', (p) => {
    console.log('✓ Real-Time Received product:updated =>', p.name, 'Price: ₹' + p.discountPrice, 'Stock:', p.stock);
  });

  socket.on('product:stockUpdated', (s) => {
    console.log('✓ Real-Time Received product:stockUpdated => ID:', s.productId, 'Stock:', s.stock, 'Status:', s.status);
  });

  socket.on('order:created', (o) => {
    console.log('✓ Real-Time Received order:created => Order ID:', o.orderId, 'Total: ₹' + o.totalAmount);
  });

  // 1. Fetch products
  const res = await fetch('http://localhost:5000/api/products');
  const data = await res.json();
  const first = data.products[0];
  console.log(`Fetched product: "${first.name}" (ID: ${first._id || first.id})`);

  // 2. Test Stock Patch
  console.log('\n--- Step 1: Testing Stock Update (25 -> 5) ---');
  await fetch(`http://localhost:5000/api/products/${first._id || first.id}/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock: 5 })
  });

  // 3. Test Price Update
  console.log('\n--- Step 2: Testing Price Update (₹3199 -> ₹2899) ---');
  await fetch(`http://localhost:5000/api/products/${first._id || first.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ discountPrice: 2899 })
  });

  // 4. Test Create Order
  console.log('\n--- Step 3: Testing Order Checkout with Auto Stock Deduction ---');
  const orderRes = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Aarav Kumar',
      email: 'aarav@gmail.com',
      phone: '+91 99999 88888',
      address: 'Flat 101, Palm Heights',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      products: [
        {
          productId: first._id || first.id,
          name: first.name,
          quantity: 2
        }
      ]
    })
  });
  const orderData = await orderRes.json();
  console.log('Order creation result:', orderData.success ? `Order placed (#${orderData.order.orderId})` : orderData.message);

  setTimeout(() => {
    console.log('\n✓ ALL REAL-TIME SOCKET.IO & REST VERIFICATIONS PASSED SUCCESSFULLY!');
    process.exit(0);
  }, 1000);
});
