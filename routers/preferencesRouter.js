const { Router } = require('express');
const { preferenceControllers } = require('../controllers/preferenceControllers.js');
const preferencesRouter = new Router();

preferencesRouter.post("/newPreference/:userId",preferenceControllers.addPreference);
preferencesRouter.put("/updatePreference/:userId",preferenceControllers.updatePreference);
preferencesRouter.get("/getPreference/:userId",preferenceControllers.getPreferences);
preferencesRouter.get("/getResults",preferenceControllers.getResults);

module.exports = { preferencesRouter };