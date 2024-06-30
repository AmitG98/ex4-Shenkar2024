const { Router } = require('express');
const { preferenceControllers } = require('../controllers/preferenceControllers.js');
const preferencesRouter = new Router();

// const tripData = require('../data/records.json');

// postsRouter.get('/', postsController.getPosts);          
// postsRouter.get('/:postId', postsController.getPost);
// postsRouter.post('/', postsController.addPost);
// postsRouter.put('/:postId', postsController.updatePost);
// postsRouter.delete('/:postId', postsController.deletePost);

preferencesRouter.post("/newPreference/:userId",preferenceControllers.addPreference);
preferencesRouter.post("/updatePreference/:userId",preferenceControllers.updatePreference);


module.exports = { preferencesRouter };