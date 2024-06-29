const { Router } = require('express');
const { preferenceControllers } = require('../controllers/preferenceControllers.js');
const preferencesRouter = new Router();

// const tripData = require('../data/records.json');

// postsRouter.get('/', postsController.getPosts);          
// postsRouter.get('/:postId', postsController.getPost);
// postsRouter.post('/', postsController.addPost);
// postsRouter.put('/:postId', postsController.updatePost);
// postsRouter.delete('/:postId', postsController.deletePost);

// postsRouter.post("/register", postsController.newUser);
// preferencesRouter.post("/newPreference", (req, res) => {
//     const { body } = req;
//     preferenceControllers.addPreference(tripData, body);
// });
preferencesRouter.post("/newPreference/:userId",preferenceControllers.addPreference);

module.exports = { preferencesRouter };