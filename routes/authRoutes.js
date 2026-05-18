const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @route   GET /auth/register
// @desc    Show register form
router.get('/register', (req, res) => {
    res.render('auth/register', { error: null });
});

// @route   POST /auth/register
// @desc    Process registration
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.render('auth/register', { error: 'User already exists' });
        }

        // Make admin if first user or email ends with @admin.com
        const isFirstUser = (await User.countDocuments({})) === 0;
        const isAdmin = isFirstUser || email.toLowerCase().endsWith('@admin.com');

        user = new User({ name, email, password, isAdmin });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Start session
        req.session.user = { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin };
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   GET /auth/login
// @desc    Show login form
router.get('/login', (req, res) => {
    res.render('auth/login', { error: null });
});

// @route   POST /auth/login
// @desc    Process login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.render('auth/login', { error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('auth/login', { error: 'Invalid credentials' });
        }

        // Start session
        req.session.user = { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin };
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   GET /auth/logout
// @desc    Logout user
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            console.error(err);
        }
        res.redirect('/');
    });
});

module.exports = router;
