const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    description: {
        required: true,
        type: String
    },
    imageUrl: {
        required: false,
        type: String
    },
    submitterName: {
        required: false,
        type: String,
        default:  "Randy Lee"
    },
    businessUseCase: {
        required: false,
        type: String
    },
    votes: {
        required: true,
        type: Number,
        default: 0
    },
    workInProgress: {
        required: true,
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Votes', projectSchema);
