const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Helper function to recalculate cart totals
function updateCartTotals(cart) {
    cart.totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// @route   GET /cart
// @desc    Show shopping cart page
router.get('/', (req, res) => {
    const cart = req.session.cart || { items: [], totalQuantity: 0, totalPrice: 0 };
    res.render('cart', { cart });
});

// @route   POST /cart
// @desc    Add product to cart
router.post('/', async (req, res) => {
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity) || 1;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Initialize cart in session if not present
        if (!req.session.cart) {
            req.session.cart = { items: [], totalQuantity: 0, totalPrice: 0 };
        }

        const cart = req.session.cart;

        // Check if item already exists in cart
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex > -1) {
            // Increment quantity
            cart.items[itemIndex].quantity += qty;
        } else {
            // Add new item
            cart.items.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: qty
            });
        }

        // Recalculate totals
        updateCartTotals(cart);

        // Save session explicitly (often handled automatically, but safe)
        req.session.cart = cart;

        // Support AJAX/JSON responses
        if (req.xhr || req.query.json || (req.headers.accept && req.headers.accept.includes('json'))) {
            return res.json({ success: true, cart, message: 'Product added to cart!' });
        }

        res.redirect('/cart');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /cart/update
// @desc    Update quantity of product in cart
router.post('/update', (req, res) => {
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity);

    if (!req.session.cart) {
        return res.redirect('/cart');
    }

    const cart = req.session.cart;
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
        if (qty <= 0) {
            // Remove item if quantity is 0 or negative
            cart.items.splice(itemIndex, 1);
        } else {
            // Update quantity
            cart.items[itemIndex].quantity = qty;
        }
        updateCartTotals(cart);
        req.session.cart = cart;
    }

    // Support AJAX/JSON responses
    if (req.xhr || req.query.json || (req.headers.accept && req.headers.accept.includes('json'))) {
        return res.json({ success: true, cart, message: 'Cart updated successfully!' });
    }

    res.redirect('/cart');
});

// @route   POST /cart/remove
// @desc    Remove product from cart
router.post('/remove', (req, res) => {
    const { productId } = req.body;

    if (!req.session.cart) {
        return res.redirect('/cart');
    }

    const cart = req.session.cart;
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
        cart.items.splice(itemIndex, 1);
        updateCartTotals(cart);
        req.session.cart = cart;
    }

    // Support AJAX/JSON responses
    if (req.xhr || req.query.json || (req.headers.accept && req.headers.accept.includes('json'))) {
        return res.json({ success: true, cart, message: 'Product removed from cart!' });
    }

    res.redirect('/cart');
});

module.exports = router;
