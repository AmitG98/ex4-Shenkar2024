const { Router } = require('express');
const { userControllers } = require('../controllers/userControllers.js');

const usersRouter = new Router();

usersRouter.post('/register', userControllers.newUser);

module.exports = { usersRouter };