const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ImageSchema = new Schema({
    id: {type: String, required: true, max: 100},
    backend: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Backend'
    },
    name: {type: String, required: true, max: 300},
    type: {type: String, required: true, max: 100}
});

// Export the model
module.exports = mongoose.model('Image', ImageSchema);