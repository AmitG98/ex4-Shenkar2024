const { Router } = require('express');
const { preferenceControllers } = require('../controllers/preferenceControllers.js');

const preferencesRouter = new Router();

// postsRouter.get('/', postsController.getPosts);          
// postsRouter.get('/:postId', postsController.getPost);
// postsRouter.post('/', postsController.addPost);
// postsRouter.put('/:postId', postsController.updatePost);
// postsRouter.delete('/:postId', postsController.deletePost);

// postsRouter.post("/register", postsController.newUser);
preferencesRouter.post("/preference/:userId", preferenceControllers.addPreference);

module.exports = { preferencesRouter };