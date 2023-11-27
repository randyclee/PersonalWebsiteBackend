const WorkHistoryModel = require('../models/work_model');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/work'));
    },
    filename: (req, file, cb) => {
        // Generating a unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname); // Extracting the extension
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage , dest: path.join(__dirname, '../uploads/work') });
exports.uploadFile = upload.single('logo')

exports.handleUpload = async (req, res) => {
    res.status(200).json({ data: 'success', filePath: `/uploads/${req.file.filename}` });
};

exports.handleImageDelete = async  (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.join(upload, filename);
  
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      res.status(200).json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  };

exports.createWorkHistory = async (req, res) => {
    const mainImagePath = req.file && req.file['filename']
        ? `/uploads/work/${req.file['filename']}`
        : `/uploads/randy_lee_logo.png`;
    const workHistoryData = {
        ...req.body,
        logo: mainImagePath
    };

    const workHistory = new WorkHistoryModel(workHistoryData);
    try {
        await workHistory.save();
        res.status(201).json(workHistory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.getResumeWorkHistory = async (req, res) => {
    try {
        const workHistory = await WorkHistoryModel.find({inResume:true}).sort({order:1});
        res.json(workHistory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getAllWorkHistory = async (req, res) => {
    try {
        const workHistory = await WorkHistoryModel.find().sort({order:1});
        res.json(workHistory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getWorkHistoryById =  async (req, res) => {
    try {
        const workHistory = await WorkHistoryModel.findById(req.params.id);
        if (!workHistory) {
            return res.status(404).send('Work history not found');
        }
        res.json(workHistory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.updateWorkHistory =  async (req, res) => {
    try {
        const workHistory = await WorkHistoryModel.findById(req.params.id);
        if (!workHistory) {
            return res.status(404).send('Work history not found');
        }


        if (req.file && req.file['filename']) {
            const oldLogoPath = workHistory.logo;
            workHistory.logo = `/uploads/work/${req.file['filename']}`;
            if (oldLogoPath && fs.existsSync(path.join(__dirname, '..', oldLogoPath))) {
                fs.unlinkSync(path.join(__dirname, '..', oldLogoPath));
            }
        }

        Object.keys(req.body).forEach(key => {
            workHistory[key] = req.body[key];
        });

        await workHistory.save();
        res.json(workHistory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.deleteWorkHistory = async (req, res) => {
    try {
        const workHistory = await WorkHistoryModel.findById(req.params.id);
        if (!workHistory) {
            return res.status(404).send('Work history not found');
        }
        if (workHistory.logo) {
            const logoPath = path.join(__dirname, '../uploads/', workHistory.logo); 
            if (fs.existsSync(logoPath)) {
                fs.unlinkSync(logoPath);
            }
        }

        await WorkHistoryModel.findByIdAndDelete(req.params.id);
        res.send(`Work history entry deleted`);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
