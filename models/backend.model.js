const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let BackendSchema = new Schema({
    type: {type: String, required: true, max: 100},
    name: {type: String, required: true, max: 100},
    content: {type: Schema.Types.Mixed, select: false }
});

// Export the model
module.exports = mongoose.model('Backend', BackendSchema);