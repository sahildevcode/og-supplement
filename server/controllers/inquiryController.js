import { Inquiry } from '../models/Inquiry.js';
import { PaymentSettings } from '../models/PaymentSettings.js';

const getIO = (req) => req.app.get('io');

// @route   POST /api/inquiries
// Customer creates a new help inquiry or support chat ticket
export const createInquiry = async (req, res) => {
  try {
    const { name, email, phone = '', subject = 'Order / Product Inquiry', message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message are required' });
    }

    const newInquiry = await Inquiry.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      subject,
      messages: [{
        sender: 'customer',
        text: message,
        timestamp: new Date()
      }]
    });

    const io = getIO(req);
    if (io) {
      io.emit('inquiry:created', newInquiry);
      console.log(`\x1b[35m[Socket.IO Broadcast]\x1b[0m inquiry:created => Ticket: ${newInquiry.ticketId} from ${email}`);
    }

    res.status(201).json({
      success: true,
      ticket: newInquiry,
      message: 'Support inquiry created successfully. Our team will assist you shortly!'
    });
  } catch (error) {
    console.error('[Create Inquiry Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/inquiries
// Admin or customer gets tickets
export const getInquiries = async (req, res) => {
  try {
    const { email } = req.query;
    const query = {};
    if (email) {
      query.email = email.toLowerCase().trim();
    }
    const tickets = await Inquiry.find(query);
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/inquiries/:id/message
// Appends a new message (from either customer or admin)
export const addMessageToInquiry = async (req, res) => {
  try {
    const { text, sender = 'customer' } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const targetId = req.params.id;
    const updateObj = {
      $push: {
        messages: {
          sender,
          text,
          timestamp: new Date()
        }
      }
    };

    if (sender === 'admin') {
      updateObj.unreadCustomer = true;
      updateObj.unreadAdmin = false;
      updateObj.status = 'in_progress';
    } else {
      updateObj.unreadAdmin = true;
      updateObj.unreadCustomer = false;
    }

    const updated = await Inquiry.findByIdAndUpdate(targetId, updateObj, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    const io = getIO(req);
    if (io) {
      io.emit('inquiry:message', {
        ticketId: updated.ticketId,
        _id: updated._id || updated.id,
        sender,
        text,
        updated
      });
    }

    res.json({ success: true, ticket: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PATCH /api/inquiries/:id/status
// Admin updates ticket status (e.g. 'resolved')
export const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Inquiry.findByIdAndUpdate(req.params.id, { status, unreadAdmin: false }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    const io = getIO(req);
    if (io) {
      io.emit('inquiry:statusUpdated', { ticketId: updated.ticketId, status: updated.status });
    }

    res.json({ success: true, ticket: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
