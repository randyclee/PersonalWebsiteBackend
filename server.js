require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Connect to MongoDB
const mongoString = process.env.MONGODB_URI;
mongoose.connect(mongoString);
const database = mongoose.connection;
database.on('error', (error) => {
    console.log(error);
});
database.once('connected', () => {
    console.log('Database Connected');
});

// Set up CORS
var corsOptions = {
    origin: "http://localhost:3000"
};

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Define routes
app.get("/", (req, res) => {
    res.json({ message: "Welcome to my API." });
});
require('./routes/routes')(app);

// Start the server
const apiBase = process.env.apiBase || 3001;
app.listen(apiBase, () => {
    console.log(`Server Started at ${apiBase}`);
});
