const { v4: uuidv4 } = require('uuid');
const { dbConnection } = require('../db_connection');

exports.postsController = {
    // GET localhost:8081/posts
    async newUser(req, res) {
        // const { dbConnection } = require('../db_connection');
        const connection = await dbConnection.createConnection();

        const { user_name, password } = req.body;
        const access_code = uuidv4();

        try {
            const connection = await dbConnection.createConnection();
            await connection.execute(`INSERT INTO tbl_53_users (access_code, user_name, password) VALUES ("${access_code}, "${user_name}", "${password}")`);
            
            connection.end();
            res.status(201).json({ accessCode:access_code });
        } catch(error) {
            res.status(400).json({ error: 'Username already exists' });
        }
    },

};