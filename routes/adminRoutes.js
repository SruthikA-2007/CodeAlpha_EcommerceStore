const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { ensureAdmin } = require('../middleware/auth');

// Protect all routes in this router with ensureAdmin middleware
router.use(ensureAdmin);

// @route   GET /admin
// @desc    Show product management dashboard
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        res.render('admin/dashboard', { products });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /admin/products/new
// @desc    Show product creation form
router.get('/products/new', (req, res) => {
    res.render('admin/product-form', { product: null, title: 'Create Product' });
});

// @route   POST /admin/products/new
// @desc    Process product creation
router.post('/products/new', async (req, res) => {
    const { name, description, price, imageUrl, category } = req.body;
    try {
        const newProduct = new Product({
            name,
            description,
            price: parseFloat(price),
            imageUrl: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
            category,
            rating: 4.5,
            numReviews: 12
        });
        await newProduct.save();
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /admin/products/:id/edit
// @desc    Show product editing form
router.get('/products/:id/edit', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.render('admin/product-form', { product, title: 'Edit Product' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /admin/products/:id/edit
// @desc    Process product update
router.post('/products/:id/edit', async (req, res) => {
    const { name, description, price, imageUrl, category } = req.body;
    try {
        const updatedFields = {
            name,
            description,
            price: parseFloat(price),
            imageUrl,
            category
        };
        const product = await Product.findByIdAndUpdate(req.params.id, { $set: updatedFields }, { new: true });
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /admin/products/:id/delete
// @desc    Process product deletion
router.post('/products/:id/delete', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
