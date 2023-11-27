const mongoose = require('mongoose');

const workHistorySchema = new mongoose.Schema({
    logo: {
        required: true,
        type: String
    },
    company: {
        required: true,
        type: String
    },
    title: {
        required: true,
        type: String
    },
    subheadings: {
        type: [String]
    },
    tags: {
        type: [String]
    },
    time: {
        required: true,
        type: String
    },
    location: {
        required: true,
        type: String
    },
    inResume:{
        required: true,
        type: Boolean
    },
    description: {
        required: true,
        type: [String]
    },
    order: {
        required: true,
        type: Number
    }
});

module.exports = mongoose.model('WorkHistory', workHistorySchema);
