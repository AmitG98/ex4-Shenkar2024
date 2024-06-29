const { Router } = require('express');
const { userControllers } = require('../controllers/userControllers.js');

const usersRouter = new Router();

// postsRouter.get('/', postsController.getPosts);          
// postsRouter.get('/:postId', postsController.getPost);
// postsRouter.post('/', postsController.addPost);
// postsRouter.put('/:postId', postsController.updatePost);
// postsRouter.delete('/:postId', postsController.deletePost);

usersRouter.post('/register', userControllers.newUser);
// postsRouter.post("/preference/:userId", postsController.addPreference);

module.exports = { usersRouter };