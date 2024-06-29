const { v4: uuidv4 } = require('uuid');
const { dbConnection } = require('../db_connection');
const tripData = require('../data/records.json');

exports.preferenceControllers = {
    async addPreference(req, res) {
        const connection = await dbConnection.createConnection();
        const { body } = req;
        try {
            const accessCodeUser = body.access_code;
            const accessCodeDB = await getPostById(req.params.userId, connection);

            if (accessCodeUser === accessCodeDB.access_code) {
                let checkSuccess = false;

                checkSuccess = checkDestination(body);
                if (!checkSuccess) {
                    res.status(400).json({ error:`Destination is not in the list` });
                } else { 
                    checkSuccess = checkType(body);
                    if (!checkSuccess) {
                        res.status(400).json({ error:`Type trip is not in the list` });
                    } else {
                        await connection.execute(`INSERT INTO tbl_53_preferences (access_code,start_date,end_date,destination,type_vacation) VALUES ("${accessCodeUser}","${body.start_date}","${body.end_date}","${body.destination}","${body.type_vacation}")`);
                        res.status(201).json({ success: `Successful connection and preferences added!` });
                    }
                }                
            } else {
                res.status(400).json({ error: 'Access code doesnt match. Connection failed!' });
            }
        } catch(error) {
            res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
        connection.end();
    },
};

async function getPostById(userId, connection) {
    const [rows] = await connection.execute(`SELECT access_code FROM tbl_53_users WHERE id =${userId}`);
    return rows[0];
}

async function checkDestination(body) {
    for (let i=0; i < tripData.destinations.length; i++) {
        if (body.destination === tripData.destinations[i].nameDest) {
            return true;
        }
    }
    return false;
}

async function checkType(body) {
    for(let i=0; i < tripData.types.length; i++) {
        if (body.type === tripData.types[i].type) {
            return true;
        }
    }
    return false;
}