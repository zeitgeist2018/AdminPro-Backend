var express = require('express');
var bcrypt = require('bcryptjs');
var authMiddleware = require('../middleware/auth');

var app = express();
var User = require('../models/user');

// Get all users
app.get('/', (req, res, next) => {
    var from = req.query.from || 0;
    from = Number(from);
    User.find({}, 'name email image role')
        .skip(from)
        .limit(5)
        .exec((err, users) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error loading users',
                    errors: err
                });
            }
            User.count({}).exec((err, totalCount) => {
                res.status(200).json({
                    ok: true,
                    users: users,
                    totalCount: totalCount
                });
            });
        });
});

// Create user
app.post('/', authMiddleware.verifyToken, (req, res) => {
    var body = req.body;
    var user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        image: body.image,
        role: body.role
    });
    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error creating user',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            user: user
        });
    });
});

// Update user
app.put('/:id', authMiddleware.verifyToken, (req, res) => {
    const id = req.params.id;
    User.findById(id, (err, user) => {
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
                message: `The user with id ${id} does not exist`,
                errors: { message: 'The user does not exist' }
            });
        }
        var body = req.body;
        user.name = body.name;
        user.email = body.email;
        user.role = body.role;
        user.save((err, user) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error updating user',
                    errors: err
                });
            }
            user.password = "";
            res.status(200).json({
                ok: true,
                message: 'User updated successfully',
                user: user
            });
        });
    });
});

// Delete user
app.delete('/:id', authMiddleware.verifyToken, (req, res) => {
    const id = req.params.id;
    User.findByIdAndRemove(id, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error deleting user',
                errors: err
            });
        }
        if (!user) {
            return res.status(400).json({
                ok: false,
                message: `The user with id ${id} does not exist`,
                errors: { message: 'The user does not exist' }
            });
        }
        res.status(200).json({
            ok: true,
            message: 'User deleted successfully',
            user: user
        });
    });
});

module.exports = app;