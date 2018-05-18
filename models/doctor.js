var mongoose = require('mongoose');


var Schema = mongoose.Schema;

var doctorSchema = new Schema({
    name: { type: String, required: [true, 'Field name is required'] },
    image: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hospital: {
        type: Schema.Types.ObjectId, ref: 'Hospital', required: [true, 'Field hospital is required']
    }
});


module.exports = mongoose.model('Doctor', doctorSchema);