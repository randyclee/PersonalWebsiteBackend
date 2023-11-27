const CategoryGame = require('../models/games_categories_model'); // Corrected model name

exports.getData = async (req, res) => {
    const language = req.params.language;
    if (!language) {
        return res.status(400).send('Language parameter is required');
    }

    try {
        const data = await CategoryGame.find({ language: language });
        res.json(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.addData = async (req, res) => {
    try {
        const newData = new CategoryGame(req.body);
        await newData.save();
        res.status(201).send('Data added successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
};
