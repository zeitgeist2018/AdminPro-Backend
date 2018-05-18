var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;

var app = express();
var User = require('../models/user');

app.post('/', (req, res) => {
    var body = req.body;
    User.findOne({ email: body.email }, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error retrieving user',
                errors: err
            });
        }
        if (!user) {
            return res.status(400).json({
                ok: false,
                message: 'Invalid credentials'
            });
        }
        if (!bcrypt.compareSync(body.password, user.password)) {
            return res.status(403).json({
                ok: true,
                message: 'Invalid credentials'
            });
        }
        user.password = "";
        var token = jwt.sign({ user: user }, SEED, { expiresIn: 14400 });
        res.status(200).json({
            ok: true,
            message: 'Logged in succesfully',
            token: token,
            user: user
        });
    });
});

module.exports = app;