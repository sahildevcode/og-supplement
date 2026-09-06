import { Category } from '../models/Category.js';

// Get active categories for customer storefront
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    console.error('[Category Controller Error - getCategories]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve categories', error: error.message });
  }
};

// Get all categories for Admin Panel (including inactive)
export const getAllCategoriesAdmin = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    console.error('[Category Controller Error - getAllCategoriesAdmin]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve admin categories', error: error.message });
  }
};

// Create a new category card
export const createCategory = async (req, res) => {
  try {
    const { name, title, desc, image, badge, colorTheme, order, isActive } = req.body;

    if (!name || !title || !image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category name, title, and image URL.'
      });
    }

    const newCategory = await Category.create({
      name,
      title,
      desc: desc || '',
      image,
      badge: badge || name,
      colorTheme: colorTheme || 'emerald',
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive !== undefined ? isActive : true
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('category:created', newCategory);
      io.emit('categories:updated', { action: 'create', category: newCategory });
    }

    res.status(201).json({
      success: true,
      message: 'Category card created successfully!',
      category: newCategory
    });
  } catch (error) {
    console.error('[Category Controller Error - createCategory]:', error);
    res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
  }
};

// Update an existing category card
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, req.body, { new: true });

    const io = req.app.get('io');
    if (io) {
      io.emit('category:updated', updatedCategory);
      io.emit('categories:updated', { action: 'update', category: updatedCategory });
    }

    res.json({
      success: true,
      message: 'Category card updated successfully!',
      category: updatedCategory
    });
  } catch (error) {
    console.error('[Category Controller Error - updateCategory]:', error);
    res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
  }
};

// Delete a category card
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await Category.findByIdAndDelete(id);

    const io = req.app.get('io');
    if (io) {
      io.emit('category:deleted', { categoryId: id });
      io.emit('categories:updated', { action: 'delete', categoryId: id });
    }

    res.json({
      success: true,
      message: 'Category card removed successfully!',
      categoryId: id
    });
  } catch (error) {
    console.error('[Category Controller Error - deleteCategory]:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category', error: error.message });
  }
};
