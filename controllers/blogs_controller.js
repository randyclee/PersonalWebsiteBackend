const BlogModel = require('../models/blogs_model'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/blogs'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 20 // 5MB file size limit
    } });

exports.uploadFile = upload.any(); 

exports.createBlog = async (req, res) => {
    let mainImageFile = req.files.find(file => file.fieldname === 'mainImage');
    const mainImagePath = mainImageFile
        ? `/uploads/blogs/${mainImageFile.filename}`
        : `/uploads/randy_lee_logo.png`;

        
    let blogData = {
        ...req.body,
        mainImage: mainImagePath,
        author: {
            name: "Randy Lee",
            image: "/uploads/randy.jpg"
        }
    };

    if (req.body.sections) {
        blogData.sections = req.body.sections.map((section, index) => {

          const sectionImageFile = req.files.find(file => file.fieldname === `sections[${index}][image]`);
          if (sectionImageFile) {
            section.image = `/uploads/blogs/${sectionImageFile.filename}`;
          }
          return section;
        });
      }
   
    try {
        const blog = new BlogModel(blogData);
        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
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


exports.getAllBlogs = async (req, res) => {
    const pageSize = 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * pageSize;

    try {
        const blogs = await BlogModel.find({}, 'title summary mainImage author slug date')
                                    .sort({ date: 'desc' }) 
                                   .skip(skip)
                                   .limit(pageSize);
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getBlogById = async (req, res) => {
    try {
        const blog = await BlogModel.findOne({slug: req.params.slug});
        if (!blog) {
            return res.status(404).send('Blog not found');
        }
        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateBlog = async (req, res) => {
    const id = req.params.id;

    try {
        // Retrieve the existing blog document from the database
        let blog = await BlogModel.findById(id);
        
        if (!blog) {
            return res.status(404).send('Blog not found');
        }

        // Handle main image
        let mainImageFile = req.files.find(file => file.fieldname === 'mainImage');
        if (mainImageFile) {
            // Delete previous main image if a new one is uploaded
            if (blog.mainImage) {
                console.log(path.join(__dirname, '..', blog.mainImage));

                fs.unlink(path.join(__dirname, '..', blog.mainImage), (err) => {
                    if (err) console.error('Error deleting previous main image:', err);
                });
            }
            blog.mainImage = `/uploads/blogs/${mainImageFile.filename}`;
        }
        if (req.body.sections) {
            blog.sections = req.body.sections.map((section, index) => {
                const sectionImageFile = req.files.find(
                    (file) => file.fieldname === `sections[${index}][image]`
                );
                if (sectionImageFile) {
                    if(section.image && fs.existsSync(path.join(__dirname, '..', section.image))){
                        fs.unlink(path.join(__dirname, '..', section.image), (err) => {
                            if (err) console.error('Error deleting previous section image:', err);
                        });
                    }
                    section.image = `/uploads/blogs/${sectionImageFile.filename}`;
                }
                return section;
            });
        }else{
            blog.sections = []
        }

        // Handle deleted images
        const deletedImages = JSON.parse(req.body.deletedImages || '[]');
        deletedImages.forEach((imagePath) => {
            const fullPath = path.join(__dirname, '..', imagePath);
            if (fs.existsSync(fullPath)) {
                fs.unlink(fullPath, (err) => {
                    if (err) console.error(`Error deleting image at ${fullPath}:`, err);
                });
            }
        });

        await BlogModel.updateOne({ _id: id }, blog);

        res.json(blog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteBlog = async (req, res) => {

    try {
        const blogToDelete = await BlogModel.findById(req.params.id);
        if (blogToDelete) {
            const mainImagePath = path.join(__dirname, '..', blogToDelete.mainImage);
            if (fs.existsSync(mainImagePath)) {
                fs.unlinkSync(mainImagePath);
            }
            
            blogToDelete.sections.forEach(section => {
                if (section.image) {
                    const sectionImagePath = path.join(__dirname, '..', section.image);
                    if (fs.existsSync(sectionImagePath)) {
                        fs.unlinkSync(sectionImagePath);
                    }
                }
            });

            await BlogModel.deleteOne({ _id: req.params.id });
            res.send(true);
        } else {
            res.status(404).send('Blog not found');
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

