const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    header: {
        type: String,
        required: false
    },
    content: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    }
});

const blogSchema = new mongoose.Schema({
    title: {
        required: true,
        type: String
    },
    date: {
        required: true,
        type: Date 
    },
    summary: {
        required: true,
        type: String
    },
    slug: {
        required: true,
        type: String
    },
    author: {
        name: {
            required: true,
            type: String
        },
        image: {
            required: true,
            type: String
        }
    },
    mainImage: {
        required: true,
        type: String
    },
    sections: {
        type: [sectionSchema],
        required: false
    }
});

module.exports = mongoose.model('Blogs', blogSchema);
