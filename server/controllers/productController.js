import { Product } from '../models/Product.js';

// Helper to get socket.io instance from app
const getIO = (req) => req.app.get('io');

// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { category, brand, search, status, sort, isBestSeller } = req.query;
    let products = await Product.find();

    // Filter by Best Seller flag (Strict: Only return products set as Best Seller by admin)
    if (isBestSeller === 'true' || isBestSeller === true) {
      products = products.filter(p => p.isBestSeller === true);
    }

    // In-memory / dynamic search filtering
    if (category && category !== 'All') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (brand && brand !== 'All') {
      products = products.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    }

    if (status && status !== 'All') {
      products = products.filter(p => p.status === status);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.flavours && p.flavours.some(f => f.toLowerCase().includes(q)))
      );
    }

    if (sort) {
      if (sort === 'price_asc') {
        products.sort((a, b) => a.discountPrice - b.discountPrice);
      } else if (sort === 'price_desc') {
        products.sort((a, b) => b.discountPrice - a.discountPrice);
      } else if (sort === 'rating') {
        products.sort((a, b) => b.rating - a.rating);
      } else if (sort === 'newest') {
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sort === 'sales' || sort === 'best_seller') {
        products.sort((a, b) => (a.bestSellerRank || 999) - (b.bestSellerRank || 999) || (b.salesCount || 0) - (a.salesCount || 0));
      }
    } else if (isBestSeller === 'true' || isBestSeller === true) {
      // Default order for Best Sellers page: rank first, then sales count, then rating
      products.sort((a, b) => (a.bestSellerRank || 999) - (b.bestSellerRank || 999) || (b.salesCount || 0) - (a.salesCount || 0) || b.rating - a.rating);
    }

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('[Get Products Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/products
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    const io = getIO(req);
    if (io) {
      io.emit('product:created', product);
      console.log(`\x1b[36m[Socket.IO Broadcast]\x1b[0m product:created => ${product.name}`);
    }
    res.status(201).json({ success: true, product, message: 'Product created successfully' });
  } catch (error) {
    console.error('[Create Product Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const io = getIO(req);
    if (io) {
      io.emit('product:updated', updated);
      console.log(`\x1b[36m[Socket.IO Broadcast]\x1b[0m product:updated => ${updated.name} (Price: ₹${updated.discountPrice}, Stock: ${updated.stock})`);
    }

    res.json({ success: true, product: updated, message: 'Product updated successfully' });
  } catch (error) {
    console.error('[Update Product Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PATCH /api/products/:id/stock
export const updateStock = async (req, res) => {
  try {
    const { stock, lowStockThreshold } = req.body;
    if (stock === undefined) {
      return res.status(400).json({ success: false, message: 'Stock value is required' });
    }

    const updatePayload = { stock: Number(stock) };
    if (lowStockThreshold !== undefined) {
      updatePayload.lowStockThreshold = Number(lowStockThreshold);
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updatePayload, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const io = getIO(req);
    if (io) {
      io.emit('product:stockUpdated', {
        productId: updated._id || updated.id,
        stock: updated.stock,
        status: updated.status,
        lowStockThreshold: updated.lowStockThreshold
      });
      io.emit('product:updated', updated);
      console.log(`\x1b[36m[Socket.IO Broadcast]\x1b[0m product:stockUpdated => ${updated.name} Stock: ${updated.stock} [${updated.status}]`);
    }

    res.json({ success: true, product: updated, message: 'Stock updated successfully' });
  } catch (error) {
    console.error('[Update Stock Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const io = getIO(req);
    if (io) {
      io.emit('product:deleted', { productId: req.params.id });
      console.log(`\x1b[36m[Socket.IO Broadcast]\x1b[0m product:deleted => ID: ${req.params.id}`);
    }

    res.json({ success: true, message: 'Product deleted successfully', productId: req.params.id });
  } catch (error) {
    console.error('[Delete Product Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/products/:id/reviews
export const addProductReview = async (req, res) => {
  try {
    const { name, rating, title, comment, images } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Please write a review comment' });
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Please select a star rating between 1 and 5' });
    }

    const updated = await Product.addReview(req.params.id, {
      name: name?.trim() || 'Verified Customer',
      rating: numRating,
      title: title?.trim() || '',
      comment: comment?.trim() || '',
      images: Array.isArray(images) ? images : (images ? [images] : [])
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const io = getIO(req);
    if (io) {
      io.emit('product:updated', updated);
      io.emit('product:review_added', { productId: req.params.id, product: updated });
      console.log(`\x1b[36m[Socket.IO Broadcast]\x1b[0m product:review_added => Product ID: ${req.params.id} (${numRating}★ by ${name})`);
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      product: updated
    });
  } catch (error) {
    console.error('[Add Product Review Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PATCH /api/products/:id/best-seller
export const toggleBestSeller = async (req, res) => {
  try {
    const { isBestSeller, bestSellerRank, bestSellerBadge } = req.body;
    const target = await Product.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updatePayload = {};
    if (isBestSeller !== undefined) updatePayload.isBestSeller = Boolean(isBestSeller);
    if (bestSellerRank !== undefined) updatePayload.bestSellerRank = Number(bestSellerRank);
    if (bestSellerBadge !== undefined) updatePayload.bestSellerBadge = String(bestSellerBadge);

    const updated = await Product.findByIdAndUpdate(req.params.id, updatePayload, { new: true });

    const io = getIO(req);
    if (io) {
      io.emit('product:updated', updated);
      io.emit('product:bestSellerUpdated', updated);
      console.log(`\x1b[36m[Socket.IO Broadcast]\x1b[0m product:bestSellerUpdated => ${updated.name} (BestSeller: ${updated.isBestSeller})`);
    }

    res.json({ success: true, product: updated, message: 'Best seller status updated!' });
  } catch (error) {
    console.error('[Toggle Best Seller Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/products/best-sellers/sync
export const syncBestSellers = async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, isBestSeller, bestSellerRank, bestSellerBadge }
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    const updatedList = [];
    for (const item of items) {
      const pid = item.id || item._id;
      if (!pid) continue;
      const updated = await Product.findByIdAndUpdate(pid, {
        isBestSeller: Boolean(item.isBestSeller),
        bestSellerRank: Number(item.bestSellerRank || 0),
        bestSellerBadge: String(item.bestSellerBadge || '')
      }, { new: true });
      if (updated) updatedList.push(updated);
    }

    const io = getIO(req);
    if (io) {
      io.emit('products:bestSellersSynced', updatedList);
    }

    res.json({ success: true, updated: updatedList, message: 'Best sellers synced successfully!' });
  } catch (error) {
    console.error('[Sync Best Sellers Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

