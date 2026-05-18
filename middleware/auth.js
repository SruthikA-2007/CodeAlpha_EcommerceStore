module.exports = {
    ensureAuth: function (req, res, next) {
        if (req.session.user) {
            return next();
        } else {
            res.redirect('/auth/login');
        }
    },
    ensureAdmin: function (req, res, next) {
        if (req.session.user && req.session.user.isAdmin) {
            return next();
        } else {
            res.status(403).send('Forbidden: Administrator access required');
        }
    }
};
