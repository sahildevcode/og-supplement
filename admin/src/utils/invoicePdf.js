import { jsPDF } from 'jspdf';

const formatCurrency = (val) => {
  const num = Number(val || 0);
  return `Rs. ${num.toLocaleString('en-IN')}`;
};

const drawHeader = (doc, title, subtitle, badgeText) => {
  // Top dark header banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 38, 'F');

  // Emerald accent strip
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 38, 210, 2, 'F');

  // Brand Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('OG-SUPPLEMENT', 14, 17);

  doc.setTextColor(52, 211, 153); // emerald-400
  doc.setFontSize(9);
  doc.text('AUTHENTIC PERFORMANCE & SPORTS NUTRITION', 14, 24);

  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(subtitle, 14, 31);

  // Right side Invoice Badge
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(140, 10, 56, 20, 3, 3, 'F');
  doc.setTextColor(52, 211, 153);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(title, 168, 18, { align: 'center' });
  doc.setTextColor(226, 232, 240);
  doc.setFontSize(8);
  doc.text(badgeText, 168, 25, { align: 'center' });
};

const drawFooter = (doc, yPos) => {
  const footerY = Math.max(yPos, 265);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, 196, footerY);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('100% Authentic & Lab-Tested Supplements | FSSAI & GMP Certified', 105, footerY + 7, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Thank you for choosing OG-Supplement! Keep this receipt for your records.', 105, footerY + 12, { align: 'center' });
};

/**
 * Generates and downloads a clean PDF receipt for Direct/Offline Store Sales
 */
export const generateOfflineInvoicePdf = (bill) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const invoiceNo = bill.billNo || `OG-POS-${Date.now().toString().slice(-6)}`;
  const dateStr = bill.createdAt
    ? new Date(bill.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  drawHeader(
    doc,
    'STORE RECEIPT',
    'Direct Offline Store Billing & Athlete Profile',
    invoiceNo
  );

  let y = 50;

  // Meta Info Row
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Date & Time: ${dateStr}`, 14, y);
  doc.text(`Payment Mode: ${bill.paymentMethod || 'Cash'}`, 196, y, { align: 'right' });

  y += 8;

  // Customer & Measurements Two-Column Cards
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 88, 34, 2.5, 2.5, 'FD');
  doc.roundedRect(108, y, 88, 34, 2.5, 2.5, 'FD');

  // Left Card: Customer Info
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('CUSTOMER DETAILS', 19, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Name: ${bill.customerName || 'Walk-in Customer'}`, 19, y + 15);
  doc.text(`Mobile: ${bill.phone || 'N/A'}`, 19, y + 22);
  if (bill.notes) {
    doc.setFontSize(8);
    doc.text(`Note: ${String(bill.notes).slice(0, 42)}`, 19, y + 29);
  }

  // Right Card: Athlete Body Measurements
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('ATHLETE MEASUREMENTS', 113, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Body Weight: ${bill.weight ? `${bill.weight} kg` : 'Not recorded'}`, 113, y + 15);
  doc.text(`Chest Size:  ${bill.chestSize ? `${bill.chestSize} in` : 'Not recorded'}`, 113, y + 22);
  doc.text(`Biceps Size: ${bill.bicepsSize ? `${bill.bicepsSize} in` : 'Not recorded'}`, 113, y + 29);

  y += 44;

  // Items Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, 182, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('#', 18, y + 6);
  doc.text('SUPPLEMENT / PRODUCT NAME', 28, y + 6);
  doc.text('QTY', 132, y + 6, { align: 'center' });
  doc.text('PRICE', 158, y + 6, { align: 'right' });
  doc.text('TOTAL', 192, y + 6, { align: 'right' });

  y += 12;

  const items = Array.isArray(bill.items) && bill.items.length > 0
    ? bill.items
    : [{ name: bill.productName || 'Supplement', quantity: Number(bill.quantity || 1), price: Number(bill.price || 0) }];

  let subtotal = 0;
  items.forEach((item, idx) => {
    const qty = Number(item.quantity || 1);
    const price = Number(item.price || 0);
    const lineTotal = qty * price;
    subtotal += lineTotal;

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 4.5, 182, 9, 'F');
    }

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(String(idx + 1), 18, y + 1.5);

    const safeName = String(item.name || 'Supplement').slice(0, 52);
    doc.setFont('helvetica', 'bold');
    doc.text(safeName, 28, y + 1.5);

    doc.setFont('helvetica', 'normal');
    doc.text(String(qty), 132, y + 1.5, { align: 'center' });
    doc.text(formatCurrency(price), 158, y + 1.5, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(lineTotal), 192, y + 1.5, { align: 'right' });

    y += 9;
  });

  y += 4;
  doc.setDrawColor(203, 213, 225);
  doc.line(115, y, 196, y);
  y += 7;

  const discount = Number(bill.discount || 0);
  const grandTotal = Math.max(0, subtotal - discount);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', 120, y);
  doc.text(formatCurrency(subtotal), 192, y, { align: 'right' });

  if (discount > 0) {
    y += 6;
    doc.setTextColor(16, 185, 129);
    doc.text('Store Discount:', 120, y);
    doc.text(`- ${formatCurrency(discount)}`, 192, y, { align: 'right' });
  }

  y += 8;
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(115, y - 5.5, 81, 11, 2, 2, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('GRAND TOTAL PAID:', 119, y + 1.5);
  doc.text(formatCurrency(grandTotal), 192, y + 1.5, { align: 'right' });

  drawFooter(doc, y + 25);

  const safeCustomer = (bill.customerName || 'Customer').replace(/[^a-z0-9]/gi, '_');
  doc.save(`${invoiceNo}_${safeCustomer}.pdf`);
};

/**
 * Generates and downloads a clean PDF Tax Invoice / Receipt for Online Orders
 */
export const generateOnlineOrderPdf = (order) => {
  if (!order) return;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const orderId = order.orderId || order._id || 'OG-ORDER';
  const dateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  drawHeader(
    doc,
    'ORDER INVOICE',
    'Official Online Order Receipt & Dispatch Summary',
    `#${orderId}`
  );

  let y = 50;

  // Order Meta
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Order Date: ${dateStr}`, 14, y);
  doc.text(`Status: ${order.orderStatus || 'Order Placed'}`, 196, y, { align: 'right' });

  y += 6;
  doc.text(`Payment Method: ${order.paymentMethod || 'Online'} (${order.paymentStatus || 'Paid'})`, 14, y);
  if (order.transactionId || order.razorpayPaymentId) {
    doc.text(`Txn ID: ${order.razorpayPaymentId || order.transactionId}`, 196, y, { align: 'right' });
  }

  y += 8;

  // Customer & Shipping Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 32, 2.5, 2.5, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('BILLED & SHIPPED TO', 19, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Customer Name: ${order.customerName || 'Customer'}`, 19, y + 14);
  doc.text(`Mobile Number: ${order.phone || 'N/A'}`, 19, y + 20);
  if (order.email) {
    doc.text(`Email: ${order.email}`, 115, y + 14);
  }
  const fullAddr = [order.address, order.city, order.state, order.pincode].filter(Boolean).join(', ');
  doc.setFontSize(8.5);
  doc.text(`Address: ${fullAddr.slice(0, 95)}`, 19, y + 27);

  y += 41;

  // Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, 182, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('#', 18, y + 6);
  doc.text('PRODUCT NAME & VARIANT', 28, y + 6);
  doc.text('QTY', 132, y + 6, { align: 'center' });
  doc.text('UNIT PRICE', 158, y + 6, { align: 'right' });
  doc.text('TOTAL', 192, y + 6, { align: 'right' });

  y += 12;

  const items = Array.isArray(order.products) ? order.products : [];
  items.forEach((item, idx) => {
    const qty = Number(item.quantity || 1);
    const price = Number(item.price || 0);
    const lineTotal = qty * price;

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 4.5, 182, 11, 'F');
    }

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(String(idx + 1), 18, y + 1);

    doc.setFont('helvetica', 'bold');
    doc.text(String(item.name || 'Supplement').slice(0, 48), 28, y + 1);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${item.variant || 'Standard'} • ${item.flavour || 'Standard'}`, 28, y + 5.5);

    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(String(qty), 132, y + 1, { align: 'center' });
    doc.text(formatCurrency(price), 158, y + 1, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(lineTotal), 192, y + 1, { align: 'right' });

    y += 11;
  });

  y += 4;
  doc.setDrawColor(203, 213, 225);
  doc.line(115, y, 196, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);

  if (order.subtotal !== undefined) {
    doc.text('Subtotal:', 120, y);
    doc.text(formatCurrency(order.subtotal), 192, y, { align: 'right' });
    y += 6;
  }

  doc.text('Shipping:', 120, y);
  doc.text(order.shippingCost > 0 ? formatCurrency(order.shippingCost) : 'FREE', 192, y, { align: 'right' });
  y += 6;

  if (order.totalGst > 0) {
    doc.text('GST / Taxes:', 120, y);
    doc.text(formatCurrency(order.totalGst), 192, y, { align: 'right' });
    y += 6;
  }

  y += 2;
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(115, y - 5.5, 81, 11, 2, 2, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL AMOUNT:', 119, y + 1.5);
  doc.text(formatCurrency(order.totalAmount), 192, y + 1.5, { align: 'right' });

  if (order.orderStatus === 'Cancelled' || order.orderStatus === 'Refunded') {
    y += 12;
    doc.setTextColor(225, 29, 72);
    doc.setFontSize(9);
    doc.text(
      `Cancellation Fee Deducted: ${formatCurrency(order.cancellationFee || 0)} | Net Refund: ${formatCurrency(order.refundAmount || 0)}`,
      196,
      y,
      { align: 'right' }
    );
  }

  drawFooter(doc, y + 24);

  const safeCustomer = (order.customerName || 'Customer').replace(/[^a-z0-9]/gi, '_');
  doc.save(`Invoice_${orderId}_${safeCustomer}.pdf`);
};
