import { Review } from '../models/Review.js';

const getIO = (req) => req.app.get('io');

// @route   GET /api/reviews
export const getReviews = async (req, res) => {
  try {
    const { transformationGoal, rating, search } = req.query;
    let reviews = await Review.find({ transformationGoal, rating });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      reviews = reviews.filter(r =>
        r.customerName.toLowerCase().includes(q) ||
        r.productUsed.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('[Get Reviews Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const {
      customerName,
      city,
      rating,
      transformationGoal,
      duration,
      gainMetric,
      productUsed,
      productId,
      title,
      comment,
      beforeImage,
      afterImage,
      reviewImages,
      isFeatured
    } = req.body;

    if (!customerName || !comment || !productUsed) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Customer Name, Product Used, and your Review / Story'
      });
    }

    const review = await Review.create({
      customerName,
      city,
      rating: Number(rating) || 5,
      transformationGoal: transformationGoal || 'Muscle Building',
      duration: duration || '12 Weeks',
      gainMetric: gainMetric || '',
      productUsed,
      productId,
      title,
      comment,
      beforeImage,
      afterImage,
      reviewImages,
      isFeatured: Boolean(isFeatured)
    });

    const io = getIO(req);
    if (io) {
      io.emit('review:created', review);
      console.log(`\x1b[36m[Socket.IO Broadcast]\x1b[0m review:created => ${review.customerName} (${review.rating}★)`);
    }

    res.status(201).json({
      success: true,
      review,
      message: 'Thank you! Your transformation review has been submitted successfully.'
    });
  } catch (error) {
    console.error('[Create Review Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/reviews/:id
export const updateReview = async (req, res) => {
  try {
    const updated = await Review.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const io = getIO(req);
    if (io) {
      io.emit('review:updated', updated);
      console.log(`\x1b[36m[Socket.IO Broadcast]\x1b[0m review:updated => ${updated._id || req.params.id}`);
    }

    res.json({ success: true, review: updated, message: 'Review updated successfully' });
  } catch (error) {
    console.error('[Update Review Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PATCH /api/reviews/:id/like
export const likeReview = async (req, res) => {
  try {
    const updated = await Review.like(req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const io = getIO(req);
    if (io) {
      io.emit('review:liked', { id: req.params.id, likes: updated.likes });
    }

    res.json({ success: true, review: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/reviews/:id
export const deleteReview = async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const io = getIO(req);
    if (io) {
      io.emit('review:deleted', { id: req.params.id });
    }

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
