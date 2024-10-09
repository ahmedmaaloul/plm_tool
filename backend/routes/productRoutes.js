// routes/productRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const productController = require('../controllers/productController');
const Product = require('../models/Product');

// Middleware to set projectIds from Product
async function setProjectIdsFromProduct(req, res, next) {
  try {
    const productId = req.params.id;

    if (!productId) {
      // For routes where productId is not provided, proceed without setting projectIds
      return next();
    }

    const product = await Product.findById(productId).populate({
      path: 'references',
      select: 'project',
      populate: { path: 'project', select: '_id' },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Collect unique projectIds from references
    const projectIdsSet = new Set();

    for (const reference of product.references) {
      if (reference.project) {
        projectIdsSet.add(reference.project._id.toString());
      }
    }

    // Convert Set to Array
    const projectIds = Array.from(projectIdsSet);

    // Attach projectIds to request parameters
    req.params.projectIds = projectIds;

    next();
  } catch (err) {
    console.error('Error in setProjectIdsFromProduct:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Create a new Product
router.post(
  '/',
  authMiddleware,
  productController.createProduct
);

// Get all Products
router.get(
  '/',
  authMiddleware,
  productController.getProducts
);

// Get a Product by ID
router.get(
  '/:id',
  authMiddleware,
  setProjectIdsFromProduct,
  productController.getProductById
);

// Update a Product
router.put(
  '/:id',
  authMiddleware,
  setProjectIdsFromProduct,
  productController.updateProduct
);

// Delete a Product
router.delete(
  '/:id',
  authMiddleware,
  setProjectIdsFromProduct,
  productController.deleteProduct
);

module.exports = router;
