const ProjectModel = require('../models/projects_model');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/projects'));
    },
    filename: (req, file, cb) => {
        // Generating a unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname); // Extracting the extension
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage , dest: path.join(__dirname, '../uploads/projects') });

exports.uploadFile = upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'images', maxCount: 4 }]);

exports.handleImageDelete = async  (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../uploads/projects', filename);

    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        res.status(200).json({ message: 'Image deleted successfully' });
    } else {
        res.status(404).json({ message: 'Image not found' });
    }
  };

exports.createProject = async (req, res) => {
    const mainImagePath = req.files && req.files['mainImage'] && req.files['mainImage'].length > 0
        ? `/uploads/projects/${req.files['mainImage'][0].filename}`
        : `/uploads/randy_lee_logo.png`;
    
    const additionalImages = req.files && req.files['images'] 
        ? req.files['images'].map(file => `/uploads/projects/${file.filename}`)
        : [];

    const projectData = {
        ...req.body,
        mainImage: mainImagePath,
        images: additionalImages
    };

    const project = new ProjectModel(projectData);
    try {
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.getAllProjects = async (req, res) => {
    try {
        const projects = await ProjectModel.find().sort({ year: -1 }); 
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getHighlightProjects = async (req, res) => {
    try {
        const projects = await ProjectModel.find({ highlight: true }).sort({ year: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getResumeProjects = async (req, res) => {
    try {
        const projects = await ProjectModel.find({ inResume: true }).sort({ year: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getProjectById =  async (req, res) => {
    try {
        const project = await ProjectModel.findById(req.params.id);
        if (!project) {
            return res.status(404).send('Project not found');
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.updateProject =  async (req, res) => {
    try {
        const project = await ProjectModel.findById(req.params.id);
        if (!project) {
            return res.status(404).send('Project not found');
        }

        // Handle main image
        if (req.files['mainImage']) {
            if (project.mainImage) {
                fs.unlink(path.join(__dirname,'..', project.mainImage), err => {
                    if (err) console.error('Error deleting main image:', err);
                });
            }
            project.mainImage = `/uploads/projects/${req.files['mainImage'][0].filename}`;
        }

        // Handle new images
        const newImages = req.files['images'] ? req.files['images'].map(file => `/uploads/projects/${file.filename}`) : [];

        let originalImages = [];
        if (req.body.originalImages) {
            if (Array.isArray(req.body.originalImages)) {
                originalImages = req.body.originalImages;
            } else if (typeof req.body.originalImages === 'string') {
                originalImages = req.body.originalImages.split(',').map(img => img.trim());
            }
        }

        // Determine images to keep
        const imagesToKeep = new Set([...newImages, ...originalImages]);

        // Delete images that are no longer needed
        project.images.forEach(imagePath => {
            if (!imagesToKeep.has(imagePath)) {
                fs.unlink(path.join(__dirname,'..', imagePath), err => {
                    if (err) console.error('Error deleting image:', err);
                });
            }
        });

        // Update project images
        project.images = Array.from(imagesToKeep);

        // Update other fields
        Object.keys(req.body).forEach(key => {
            if (key !== 'images' && key !== 'mainImage') {
                project[key] = req.body[key];
            }
        });

        await project.save();
        res.json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


exports.deleteProject = async (req, res) => {
    try {
        const project = await ProjectModel.findById(req.params.id);
        if (!project) {
            return res.status(404).send('Project not found');
        }

        // Function to delete a file if it exists
        const deleteFileIfExists = (filePath) => {
            const resolvedPath = path.join(__dirname, '../uploads/projects', filePath.split('/uploads/projects/')[1]);
            if (fs.existsSync(resolvedPath)) {
                fs.unlinkSync(resolvedPath);
            }
        };

        // Delete main image if exists
        if (project.mainImage && project.mainImage !== '/uploads/randy_lee_logo.png') {
            deleteFileIfExists(project.mainImage);
        }

        // Delete additional images if exist
        if (Array.isArray(project.images)) {
            project.images.forEach(imagePath => {
                if (imagePath) {
                    deleteFileIfExists(imagePath);
                }
            });
        }

        await ProjectModel.findByIdAndDelete(req.params.id);
        res.send(`Project ${project.title} deleted successfully`);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

