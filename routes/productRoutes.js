const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @route   GET /products
// @desc    Get all products with search and filter
router.get('/', async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};
        
        // Build query based on search params
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (category) {
            query.category = category;
        }

        const products = await Product.find(query);

        // Support AJAX/JSON requests
        if (req.query.json || req.xhr || (req.headers.accept && req.headers.accept.includes('json'))) {
            return res.json({ products });
        }

        const categories = await Product.distinct('category');

        res.render('products', {
            products,
            categories,
            searchQuery: search || '',
            selectedCategory: category || ''
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /products/:id
// @desc    Get single product details
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).render('index', { title: 'Product Not Found' });
        }
        
        // Fetch up to 4 related products in the same category (excluding current product)
        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        }).limit(4);

        res.render('product-details', {
            product,
            relatedProducts
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
