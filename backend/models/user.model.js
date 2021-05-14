const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const findOrCreate = require('mongoose-find-or-create')

let UserSchema = new Schema({
    googleId: {type: String, unique: true, required: true},
    email: {type: String, unique: false, required: false},
    name: {type: String, unique: false, required: false},
    picture: {type: String, unique: false, required: false},
});

UserSchema.plugin(findOrCreate)

// Export the model
module.exports = mongoose.model('User', UserSchema);
