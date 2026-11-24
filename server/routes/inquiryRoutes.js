import express from 'express';
import {
  createInquiry,
  getInquiries,
  addMessageToInquiry,
  updateInquiryStatus
} from '../controllers/inquiryController.js';

const router = express.Router();

router.post('/', createInquiry);
router.get('/', getInquiries);
router.post('/:id/message', addMessageToInquiry);
router.patch('/:id/status', updateInquiryStatus);

export default router;
