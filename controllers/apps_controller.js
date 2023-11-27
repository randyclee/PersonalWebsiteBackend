const AppModel = require('../models/apps_model');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/apps'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname); 
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage , dest: path.join(__dirname, '../uploads/apps') });
exports.uploadFile = upload.single('image');

exports.handleUpload = async (req, res) => {
    res.status(200).json({ data: 'success', filePath: `/uploads/apps/${req.file.filename}` });
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

exports.createApp = async (req, res) => {
    const imagePath = req.file && req.file['filename']
        ? `/uploads/apps/${req.file['filename']}`
        : `/uploads/randy_lee_logo.png`;
    
    const appData = {
        ...req.body,
        image: imagePath
    };

    const app = new AppModel(appData);
    try {
        await app.save();
        res.status(201).json(app);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.getAllApps = async (req, res) => {
    try {
        const apps = await AppModel.find().sort([
            ['hearts', -1]
        ]);
        res.json(apps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getAppById =  async (req, res) => {
    try {
        const app = await AppModel.findById(req.params.id);
        if (!app) {
            return res.status(404).send('App not found');
        }
        res.json(app);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.updateApp =  async (req, res) => {
    try {
        const app = await AppModel.findById(req.params.id);
        if (!app) {
            return res.status(404).send('App not found');
        }

        if (req.file && req.file['filename']) {
            const oldImagePath = app.image;
            app.image = `/uploads/apps/${req.file['filename']}`;
            if (oldImagePath && fs.existsSync(path.join(__dirname, '..', oldImagePath))) {
                fs.unlinkSync(path.join(__dirname, '..', oldImagePath));
            }
        }

        Object.keys(req.body).forEach(key => {
            app[key] = req.body[key];
        });

        await app.save();
        res.json(app);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.deleteApp = async (req, res) => {
    try {
        const app = await AppModel.findById(req.params.id);
        if (!app) {
            return res.status(404).send('App not found');
        }
        if (app.image) {
            const mainImagePath = path.join(__dirname, '../uploads/apps/', app.image); 
            if (fs.existsSync(mainImagePath)) {
                fs.unlinkSync(mainImagePath);
            }
        }

        await AppModel.findByIdAndDelete(req.params.id);
        res.send(true);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.heartApp = async (req, res) => {
    try {
        const app = await AppModel.findById(req.params.id);
        if (!app) {
            return res.status(404).send('App not found');
        }
        
        app.hearts += 1;

        await app.save();
        res.json({ message: 'Hearted app', hearts: app.hearts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
