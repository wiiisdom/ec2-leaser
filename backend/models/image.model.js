const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ImageSchema = new Schema({
    name: {type: String, required: true, max: 300},
    description: {type: String, required: true, max: 300},
    backend: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Backend'
    },
    content: {type: Schema.Types.Mixed, select: false }
});

// Export the model
module.exports = mongoose.model('Image', ImageSchema);