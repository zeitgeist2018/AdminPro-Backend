var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var app = express();

// Body parser
// This is a middleware that converts the
// request body in json 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var doctorRoutes = require('./routes/doctor');
var searchRoutes = require('./routes/search');
var uploadRoutes = require('./routes/upload');
var imagesRoutes = require('./routes/images');

// Database
mongoose.connection.openUri('mongodb://localhost:27017/HospitalDB', (err, res) => {
    if (err) {
        throw err;
    } else {
        console.log('Connected to database.');
    }
});

// Middleware
app.use('/', appRoutes);
app.use('/users', userRoutes);
app.use('/login', loginRoutes);
app.use('/hospitals', hospitalRoutes);
app.use('/doctors', doctorRoutes);
app.use('/search', searchRoutes);
app.use('/upload', uploadRoutes);
app.use('/images', imagesRoutes);

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});