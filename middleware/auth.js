/*
*   JWT Auth middleware to be used in any route that needs authentication
*/
const SEED = require('../config/config').SEED;
var jwt = require('jsonwebtoken');

exports.verifyToken = function (req, res, next) {
    var token = req.query.token;
    if (!token) {
        token = req.headers.authorization;
    }
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                message: 'Invalid token',
                errors: err
            });
        }
        // Save user information in the request so
        // we can access it anywhere
        req.user = decoded.user;
        next();
    });
}

exports.isAdmin = function (req, res, next) {
    const user = req.user;
    if (user.role === 'ROLE_ADMIN') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            message: 'Invalid role',
            errors: {message: 'Access denied'}
        });
    }
}

exports.isAdminOrSameUser = function (req, res, next) {
    const user = req.user;
    var id = req.params.id;
    if (user.role === 'ROLE_ADMIN' || user._id === id) {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            message: 'Invalid role',
            errors: {message: 'Access denied'}
        });
    }
}