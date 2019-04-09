var express = require('express');
var authMiddleware = require('../middleware/auth');

var app = express();
var Doctor = require('../models/doctor');


// Get all Doctors
app.get('/', (req, res, next) => {
    var from = req.query.from || 0;
    from = Number(from);
    Doctor.find({})
        .skip(from)
        .limit(5)
        .populate('user', 'name email')
        .populate('hospital')
        .exec((err, doctors) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error loading doctors',
                    errors: err
                });
            }
            Doctor.count({}).exec((err, totalCount) => {
                res.status(200).json({
                    ok: true,
                    doctors: doctors,
                    totalCount: totalCount
                });
            });
        });
});

// Get by Id
app.get('/:id', (req, res) => {
    const id = req.params.id;
    Doctor.findById(id)
        .populate('user', 'name email image')
        .populate('hospital')
        .exec((err, doctor) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error retrieving doctor',
                    errors: err
                });
            }
            if (!doctor) {
                return res.status(400).json({
                    ok: false,
                    message: `The doctor with id ${id} does not exist`,
                    errors: {message: 'The doctor does not exist'}
                });
            }
            res.status(200).json({
                ok: true,
                doctor: doctor
            });
        });
});

// Create Doctor
app.post('/', authMiddleware.verifyToken, (req, res, next) => {
    var body = req.body;
    var doctor = new Doctor({
        name: body.name,
        user: req.user._id,
        hospital: body.hospital
    });
    doctor.save((err, doctor) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error saving doctor',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            message: 'Doctor created successfully',
            doctor: doctor
        });
    });
});

// Update doctor
app.put('/:id', authMiddleware.verifyToken, (req, res) => {
    const id = req.params.id;
    Doctor.findById(id, (err, doctor) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error retrieving doctor',
                errors: err
            });
        }
        if (!doctor) {
            return res.status(400).json({
                ok: false,
                message: `The doctor with id ${id} does not exist`,
                errors: {message: 'The doctor does not exist'}
            });
        }
        var body = req.body;
        doctor.name = body.name;
        doctor.user = req.user._id;
        doctor.hospital = body.hospital;
        doctor.save((err, doctor) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error updating doctor',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                message: 'Doctor updated successfully',
                doctor: doctor
            });
        });
    });
});

// Delete doctor
app.delete('/:id', authMiddleware.verifyToken, (req, res) => {
    const id = req.params.id;
    Doctor.findByIdAndRemove(id, (err, doctor) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error deleting doctor',
                errors: err
            });
        }
        if (!doctor) {
            return res.status(400).json({
                ok: false,
                message: `The doctor with id ${id} does not exist`,
                errors: {message: 'The doctor does not exist'}
            });
        }
        res.status(200).json({
            ok: true,
            message: 'Doctor deleted successfully',
            doctor: doctor
        });
    });
});

module.exports = app;