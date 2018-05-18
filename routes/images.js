var express = require('express');
const path = require('path');
const fs = require('fs');

var app = express();

app.get('/:collection/:image', (req, res, next) => {
    var collection = req.params.collection;
    var image = req.params.image;
    var imagePath = path.resolve(__dirname, `../uploads/${collection}/${image}`);
    //console.log('exits: ' + typeof fs.existsSync(imagePath));
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        var noImage = path.resolve(__dirname, '../assets/no-image.png');
        res.sendFile(noImage);
    }
});

module.exports = app;