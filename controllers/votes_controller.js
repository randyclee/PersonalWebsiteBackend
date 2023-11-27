const VotesModel = require('../models/votes_model');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/votes'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname); 
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage , dest: path.join(__dirname, '../uploads/votes') });
exports.uploadFile = upload.single('imageUrl');

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

exports.createVoteProject = async (req, res) => {
    const imagePath = req.file && req.file['filename']
        ? `/uploads/votes/${req.file['filename']}`
        : `/uploads/randy_lee_logo.png`;
    
    const projectData = {
        ...req.body,
        imageUrl: imagePath
    };

    const project = new VotesModel(projectData);
    try {
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.getAllVoteProjects = async (req, res) => {
    try {
        const projects = await VotesModel.find().sort([
            ['votes', -1]
        ]);
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getVoteProjectById =  async (req, res) => {
    try {
        const project = await VotesModel.findById(req.params.id);
        if (!project) {
            return res.status(404).send('Project not found');
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.updateVoteProject =  async (req, res) => {
    try {
        const project = await VotesModel.findById(req.params.id);
        if (!project) {
            return res.status(404).send('Project not found');
        } 

        if (req.file && req.file['filename']) {
            const oldImagePath = project.imageUrl;
            const newImagePath = `/uploads/votes/${req.file['filename']}`;
        
            if (oldImagePath !== newImagePath) {
                project.imageUrl = newImagePath;
                const fullPath = path.join(__dirname, '..', oldImagePath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            }
        }
        

        Object.keys(req.body).forEach(key => {
            project[key] = req.body[key];
        });

        await project.save();
        res.json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.deleteVoteProject = async (req, res) => {
    try {
        const project = await VotesModel.findById(req.params.id);
        if (!project) {
            return res.status(404).send('Project not found');
        }
        if (project.imageUrl) {
            const imagePath = path.join(__dirname, '..', project.imageUrl); 
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await VotesModel.findByIdAndDelete(req.params.id);
        res.send(true);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.voteProject = async (req, res) => {
    try {
        const project = await VotesModel.findById(req.params.id);
        if (!project) {
            return res.status(404).send('Project not found');
        }
        
        project.votes += 1;

        await project.save();
        res.json({ message: 'Voted project', votes: project.votes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
