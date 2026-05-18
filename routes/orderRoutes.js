const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { ensureAuth } = require('../middleware/auth');

// @route   GET /orders/checkout
// @desc    Show checkout page
router.get('/checkout', ensureAuth, (req, res) => {
    const cart = req.session.cart;

    if (!cart || cart.items.length === 0) {
        return res.redirect('/cart');
    }

    res.render('checkout', { cart });
});

// @route   POST /orders/checkout
// @desc    Process checkout and place order
router.post('/checkout', ensureAuth, async (req, res) => {
    const cart = req.session.cart;
    const { address, phone } = req.body;

    if (!cart || cart.items.length === 0) {
        return res.redirect('/cart');
    }

    if (!address || !phone) {
        return res.render('checkout', { cart, error: 'All fields are required.' });
    }

    try {
        // Map cart items to order products format
        const orderProducts = cart.items.map(item => ({
            product: item.productId,
            quantity: item.quantity
        }));

        // Create new order
        const order = new Order({
            user: req.session.user.id,
            products: orderProducts,
            shippingAddress: address,
            phone: phone,
            totalAmount: cart.totalPrice
        });

        await order.save();

        // Clear cart session
        req.session.cart = { items: [], totalQuantity: 0, totalPrice: 0 };

        res.redirect(`/orders/success/${order._id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /orders/success/:id
// @desc    Show order success page
router.get('/success/:id', ensureAuth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('products.product');
        
        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Security check: verify this order belongs to the logged-in user
        if (order.user.toString() !== req.session.user.id) {
            return res.status(401).send('Unauthorized');
        }

        res.render('order-success', { order });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /orders/history
// @desc    Show order history page
router.get('/history', ensureAuth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.session.user.id })
            .populate('products.product')
            .sort({ createdAt: -1 });

        res.render('order-history', { orders });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
