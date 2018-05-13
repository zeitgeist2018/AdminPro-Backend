var express = require('express');
var mongoose = require('mongoose');

var app = express();

mongoose.connection.openUri('mongodb://localhost:27017/HospitalDB', (err, res) => {
    if (err) {
        throw err;
    } else {
        console.log('Connected to database.');
    }
});

app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        message: 'Request completed'
    });
});


app.listen(3000, () => {
    console.log('Server listening on port 3000');
});