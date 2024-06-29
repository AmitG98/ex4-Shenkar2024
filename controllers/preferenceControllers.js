const { v4: uuidv4 } = require('uuid');
const { dbConnection } = require('../db_connection');

exports.preferenceControllers = {
    async addPreference(req, res) {
            const connection = await dbConnection.createConnection();
            const { body } = req;

            const accessCodeUser = body.access_code;
            const [accessCodeDB] = await connection.execute(`SELECT access_code FROM tbl_53_users WHERE id=${req.params.userId}`);
            await connection.execute(`INSERT INTO tbl_53_preferences (access_code) VALUES ("${accessCodeUser}")`);
            
            connection.end();

            if (accessCodeUser == accessCodeDB[0].access_code) {
                res.status(201).json({ success:`Successful connection` });
            } else {
                res.status(400).json({ error: 'Access code doesnt match. Connection failed!' });
            }
    },
};