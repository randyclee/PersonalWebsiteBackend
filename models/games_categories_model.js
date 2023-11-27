const mongoose = require('mongoose');

const categoriesSchema = new mongoose.Schema({
    language: String,
    data: {
        type: Map,
        of: mongoose.Schema.Types.Mixed // This represents a JSON type
    }
});

module.exports = mongoose.model('CategoryGame', categoriesSchema);
