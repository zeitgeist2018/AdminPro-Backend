var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var validRoles = {
    values: ['ROLE_ADMIN', 'ROLE_USER'],
    message: '{VALUE} is not a valid role.'
};

var userSchema = new Schema({
    name: { type: String, required: [true, 'Field name is compulsory'] },
    email: { type: String, unique: true, required: [true, 'Field email is compulsory'] },
    password: { type: String, required: [true, 'Field password is compulsory'] },
    image: { type: String },
    role: { type: String, required: [true, 'Field role is compulsory'], default: 'ROLE_USER', enum: validRoles },
    google: { type: Boolean, default: false }
});

userSchema.plugin(uniqueValidator, { message: 'The email already exists' });

module.exports = mongoose.model('User', userSchema);