/*
*   JWT Auth middleware to be used in any route that needs authentication
*/
const SEED = require('../config/config').SEED;
var jwt = require('jsonwebtoken');

exports.verifyToken = function (req, res, next) {
    var token = req.query.token;
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