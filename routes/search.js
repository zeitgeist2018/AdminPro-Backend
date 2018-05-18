var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');
var User = require('../models/user');

app.get('/collection/:table/:search', (req, res) => {
    var table = req.params.table;
    var search = req.params.search;
    var regex = new RegExp(search, 'i');
    var promise;
    switch (table) {
        case 'users':
            promise = searchUsers(search, regex);
            break;
        case 'hospitals':
            promise = searchHospitals(search, regex);
            break;
        case 'doctors':
            promise = searchDoctors(search, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                message: 'Please specify the collection'
            });
            break;
    }
    promise.then(data => {
        return res.status(200).json({
            ok: true,
            [table]: data
        });
    });
});

app.get('/all/:search', (req, res) => {
    var search = req.params.search;
    var regex = new RegExp(search, 'i');
    Promise.all([
        searchHospitals(search, regex),
        searchDoctors(search, regex),
        searchUsers(search, regex)
    ]).then(responses => {
        res.status(200).json({
            ok: true,
            hospitals: responses[0],
            doctors: responses[1],
            users: responses[2]
        });
    });
});

function searchHospitals(search, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ name: regex })
            .populate('user', 'name email')
            .exec((err, hospitals) => {
                if (err) {
                    reject('Error searching for Hospitals');
                } else {
                    resolve(hospitals);
                }
            });
    });
}

function searchDoctors(search, regex) {
    return new Promise((resolve, reject) => {
        Doctor.find({ name: regex })
            .populate('user', 'name email')
            .populate('hospital')
            .exec((err, doctors) => {
                if (err) {
                    reject('Error searching for Doctors');
                } else {
                    resolve(doctors);
                }
            });
    });
}

function searchUsers(search, regex) {
    return new Promise((resolve, reject) => {
        User.find({}, 'name email role')
            .or([
                { name: regex },
                { email: regex }
            ]).exec((err, users) => {
                if (err) {
                    reject('Error searching for Users');
                } else {
                    resolve(users);
                }
            });
    });
}

module.exports = app;