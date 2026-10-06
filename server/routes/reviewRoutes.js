import express from 'express';
import {
  getReviews,
  createReview,
  likeReview,
  deleteReview
} from '../controllers/reviewController.js';

const router = express.Router();

router.get('/', getReviews);
router.post('/', createReview);
router.patch('/:id/like', likeReview);
router.delete('/:id', deleteReview);

export default router;
