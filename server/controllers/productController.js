import { Product } from '../models/Product.js';

// Helper to get socket.io instance from app
const getIO = (req) => req.app.get('io');

// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { category, brand, search, status, sort } = req.query;
    let products = await Product.find();

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
      }
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
