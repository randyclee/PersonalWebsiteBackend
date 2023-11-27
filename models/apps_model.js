const mongoose = require('mongoose');

const appSchema = new mongoose.Schema({
    title: {
        required: true,
        type: String
    },
    description: {
        required: true,
        type: String
    },
    image: {
        required: true,
        type: String
    },
    link: {
        required: true,
        type: String
    },
    tags: {
        required: true,
        type: [String]
    },
    hearts: {
        required: true,
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Apps', appSchema);
