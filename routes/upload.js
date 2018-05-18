var express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');

var User = require('../models/user');
var Doctor = require('../models/doctor');
var Hospital = require('../models/hospital');

var app = express();
app.use(fileUpload());

const allowed_collections = ['hospitals', 'doctors', 'users'];
const allowed_extensions = ['png', 'jpg', 'jpeg', 'gif'];

app.put('/:collection/:id', (req, res, next) => {
    var collection = req.params.collection;
    var id = req.params.id;
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No files provided',
            errors: { message: 'You must select an image' }
        });
    }

    // Get file name
    var file = req.files.image;
    var filenameArray = file.name.split('.');
    var extension = filenameArray[filenameArray.length - 1];

    // Validate extension
    if (allowed_extensions.indexOf(extension) === -1) {
        return res.status(400).json({
            ok: false,
            message: 'Invalid file extension',
            errors: { message: 'Valid extensions: ' + allowed_extensions.join(', ') }
        });
    }

    // Generate file name
    var newFilename = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // Move file to its new path
    if (allowed_collections.indexOf(collection) === -1) {
        return res.status(400).json({
            ok: false,
            message: 'Invalid collection',
            errors: { message: `Valid collections: ${allowed_collections.join(', ')}` }
        });
    }
    var path = `./uploads/${collection}/${newFilename}`;
    file.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'An error ocurred',
                errors: err
            });
        }
        uploadByCollection(collection, id, newFilename, res);
    });
});

function uploadByCollection(collection, id, filename, response) {
    switch (collection) {
        case 'users':
            User.findById(id, (err, user) => {
                if (!user) {
                    return response.status(404).json({
                        ok: false,
                        message: 'User not found'
                    });
                }
                var oldPath = 'uploads/users/' + user.image;
                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath);
                }
                user.image = filename;
                user.save((err, updatedUser) => {
                    updatedUser.password = '';
                    return response.status(200).json({
                        ok: true,
                        message: 'User image uploaded successfully',
                        user: updatedUser
                    });
                });
            });
            break;
        case 'hospitals':
            Hospital.findById(id, (err, hospital) => {
                if (!hospital) {
                    return response.status(404).json({
                        ok: false,
                        message: 'Hospital not found'
                    });
                }
                var oldPath = 'uploads/hospitals/' + hospital.image;
                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath);
                }
                hospital.image = filename;
                hospital.save((err, updatedHospital) => {
                    return response.status(200).json({
                        ok: true,
                        message: 'Hospital image uploaded successfully',
                        hospital: updatedHospital
                    });
                });
            });
            break;
        case 'doctors':
            Doctor.findById(id, (err, doctor) => {
                if (!doctor) {
                    return response.status(404).json({
                        ok: false,
                        message: 'Doctor not found'
                    });
                }
                var oldPath = 'uploads/doctors/' + doctor.image;
                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath);
                }
                doctor.image = filename;
                doctor.save((err, updatedDoctor) => {
                    return response.status(200).json({
                        ok: true,
                        message: 'Doctor image uploaded successfully',
                        doctor: updatedDoctor
                    });
                });
            });
            break;
    }
}

module.exports = app;