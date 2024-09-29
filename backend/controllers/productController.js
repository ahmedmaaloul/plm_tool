// controllers/productController.js

const Product = require('../models/Product');
const Reference = require('../models/Reference');
const AuditLog = require('../models/AuditLog');

// Create a new Product
const createProduct = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const product = new Product({
      name,
      description,
    });

    await product.save();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Created product: ${name}`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all Products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('references', 'code');

    res.json({ products });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a Product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('references', 'code');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a Product
const updateProduct = async (req, res) => {
  try {
    const { name, description } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (name) product.name = name;
    if (description) product.description = description;

    await product.save();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Updated product: ${product.name}`,
    });
    await auditLog.save();

    res.json({ message: 'Product updated successfully', product });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a Product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product has associated references
    const references = await Reference.find({ product: product._id });

    if (references.length > 0) {
      return res.status(400).json({ error: 'Cannot delete product; it has associated references' });
    }

    await product.remove();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Deleted product: ${product.name}`,
    });
    await auditLog.save();

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
