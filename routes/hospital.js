var express = require('express');
var authMiddleware = require('../middleware/auth');

var app = express();
var Hospital = require('../models/hospital');

// Get by Id
app.get('/:id', (req, res, next) => {
    const id = req.params.id;
    Hospital.findById(id)
        .populate('user', 'name email img')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error loading hospital',
                    errors: err
                });
            }
            if(!hospital){
                return res.status(400).json({
                    ok: false,
                    message: `The hospital with id ${id} does not exist`,
                    errors: { message: 'The hospital does not exist' }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        });
});

// Get all Hospitals
app.get('/', (req, res, next) => {
    var from = req.query.from || 0;
    from = Number(from);
    Hospital.find({})
        .skip(from)
        .limit(5)
        .populate('user', 'name email')
        .exec((err, hospitals) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error loading hospitals',
                    errors: err
                });
            }
            Hospital.count({}).exec((err, totalCount) => {
                res.status(200).json({
                    ok: true,
                    hospitals: hospitals,
                    totalCount: totalCount
                });
            });
        });
});

// Create Hospital
app.post('/', authMiddleware.verifyToken, (req, res, next) => {
    var body = req.body;
    var hospital = new Hospital({
        name: body.name,
        user: req.user._id
    });
    hospital.save((err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error saving hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            message: 'Hospital created successfully',
            hospital: hospital
        });
    });
});

// Update hospital
app.put('/:id', authMiddleware.verifyToken, (req, res) => {
    const id = req.params.id;
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error retrieving hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                message: `The hospital with id ${id} does not exist`,
                errors: { message: 'The hospital does not exist' }
            });
        }
        var body = req.body;
        hospital.name = body.name;
        hospital.user = req.user._id;
        hospital.save((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error updating hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                message: 'Hospital updated successfully',
                hospital: hospital
            });
        });
    });
});

// Delete hospital
app.delete('/:id', authMiddleware.verifyToken, (req, res) => {
    const id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error deleting hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                message: `The hospital with id ${id} does not exist`,
                errors: { message: 'The hospital does not exist' }
            });
        }
        res.status(200).json({
            ok: true,
            message: 'Hospital deleted successfully',
            hospital: hospital
        });
    });
});

module.exports = app;