require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

const { preferencesRouter } = require('./routers/preferencesRouter.js');
const { usersRouter } = require('./routers/usersRouter.js');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.set('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE");
    res.set('Content-Type', 'application/json');
    next();
});

app.use('/api/users', usersRouter);
app.use('/api/preferneces', preferencesRouter);

app.use((req, res) => {
    res.status(400).send('Something is broken!');
});

app.listen(port);
console.log(`listening on port ${port}`);