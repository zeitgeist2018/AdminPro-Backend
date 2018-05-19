var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;

// Google
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = require('../config/config').CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

var app = express();
var User = require('../models/user');


// Google SignIn
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    return {
        name: payload.name,
        email: payload.email,
        image: payload.picture,
        google: true
    }
}

app.post('/google', async (req, res) => {
    //const token = req.body.token;
    const token = req.headers.authorization;
    let googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                message: 'Invalid token'
            });
        });
    User.findOne({ email: googleUser.email }, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error retrieving user',
                errors: err
            });
        }
        if (user) { // The user exists in the database
            if (user.google === false) {    // It exists, but used traditional registration
                return res.status(400).json({
                    ok: false,
                    message: 'You registered with email and password. Please login with email and password.'
                });
            }
            // It exists and used google registration/login
            var token = jwt.sign({ user: user }, SEED, { expiresIn: 14400 });
            res.status(200).json({
                ok: true,
                message: 'Logged in succesfully',
                token: token,
                user: user
            });
        } else {    // User's first Google SignIn
            let user = new User({
                name: googleUser.name,
                email: googleUser.email,
                image: googleUser.image,
                password: ' ',
                google: true
            });
            user.save((err, savedUser) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error registering user',
                        errors: err
                    });
                }
                var token = jwt.sign({ user: user }, SEED, { expiresIn: 14400 });
                return res.status(200).json({
                    ok: true,
                    message: 'User registered successfully',
                    user: savedUser,
                    token: token
                });
            });
        }
    });
});

// User/Password Authentication
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