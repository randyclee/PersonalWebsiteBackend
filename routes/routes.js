module.exports = app =>{
    const ProjectsController = require("../controllers/projects_controller.js");
    const BlogsController = require("../controllers/blogs_controller.js");
    const AppsController = require('../controllers/apps_controller');
    const VotesController = require('../controllers/votes_controller.js');
    const WorkController = require('../controllers/work_controller');
    const CategoryGameController = require('../controllers/games_categories_controller');

    var router = require("express").Router();
    
    router.post('/create-project', ProjectsController.uploadFile, ProjectsController.createProject);
    router.get('/get-projects', ProjectsController.getAllProjects);
    router.get('/get-highlight-projects', ProjectsController.getHighlightProjects);
    router.get('/get-resume-projects', ProjectsController.getResumeProjects);
    router.get('/project/:id', ProjectsController.getProjectById);
    router.post('/update-project/:id', ProjectsController.uploadFile, ProjectsController.updateProject);
    router.delete('/delete-project/:id', ProjectsController.deleteProject);
    router.delete('/delete-project-image/:filename', ProjectsController.handleImageDelete);

    router.post('/create-blog', BlogsController.uploadFile, BlogsController.createBlog);
    router.get('/get-blogs', BlogsController.getAllBlogs); 
    router.get('/blog/:slug', BlogsController.getBlogById); 
    router.patch('/update-blog/:id', BlogsController.uploadFile, BlogsController.updateBlog); 
    router.delete('/delete-blog/:id', BlogsController.deleteBlog);
    router.delete('/delete-blog-image/:filename', BlogsController.handleImageDelete);

    router.post('/create-app', AppsController.uploadFile, AppsController.createApp);
    router.get('/get-apps', AppsController.getAllApps);
    router.get('/app/:id', AppsController.getAppById);
    router.patch('/update-app/:id', AppsController.uploadFile, AppsController.updateApp);
    router.delete('/delete-app/:id', AppsController.deleteApp);
    router.post('/heart-app/:id', AppsController.heartApp);
    router.delete('/delete-app-image/:filename', AppsController.handleImageDelete);

    router.post('/create-vote', VotesController.uploadFile, VotesController.createVoteProject);
    router.get('/get-votes', VotesController.getAllVoteProjects);
    router.get('/vote/:id', VotesController.getVoteProjectById);
    router.patch('/update-vote/:id', VotesController.uploadFile, VotesController.updateVoteProject);
    router.delete('/delete-vote/:id', VotesController.deleteVoteProject);
    router.post('/vote-project/:id', VotesController.voteProject);
    router.delete('/delete-vote-image/:filename', VotesController.handleImageDelete);

    router.post('/create-work-history', WorkController.uploadFile, WorkController.createWorkHistory);
    router.get('/get-work-history', WorkController.getAllWorkHistory);
    router.get('/get-work-history-resume', WorkController.getResumeWorkHistory);
    router.get('/work-history/:id', WorkController.getWorkHistoryById);
    router.patch('/update-work-history/:id', WorkController.uploadFile, WorkController.updateWorkHistory);
    router.delete('/delete-work-history/:id', WorkController.deleteWorkHistory);
    router.delete('/delete-work-image/:filename', WorkController.handleImageDelete);

    router.get('/getGameData/:language', CategoryGameController.getData);
    router.post('/getGameData/addData', CategoryGameController.addData);

    app.use('/api', router);
};
