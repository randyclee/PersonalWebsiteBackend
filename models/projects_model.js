const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        required: true,
        type: String
    },
    tags: {
        required: true,
        type: [String]
    },
    description: {
        required: true,
        type: String
    },
    achievements: {
        required: true,
        type: [String]
    },
    considerations: {
        required: true,
        type: String
    },
    improvements: {
        required: true,
        type: String
    },
    resumeHeading: {
        required: true,
        type: String
    },
    year: {
        required: true,
        type: Number
    },
    mainImage: {
        required: false,
        type: String
    },
    images: {
        required: false,
        type: [String],
        default: []
    },
    resumePoints: {
        required: false,
        type: [String]
    },
    inResume: {
        required: true,
        type: Boolean
    },
    highlight: {
        required: true,
        type: Boolean
    }
});

module.exports = mongoose.model('Projects', projectSchema);
