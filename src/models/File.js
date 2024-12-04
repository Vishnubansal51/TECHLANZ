const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploadTimestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('File', fileSchema);
