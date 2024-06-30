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
            // let errorsData = [];

            if (accessCodeUser === accessCodeDB.access_code) {
                let checkSuccess = true;

                checkSuccess = await checkDestination(body);
                if (!checkSuccess) {
                    res.status(400).json({ error:`Destination is not in the list` });
                } else {
                    checkSuccess = await checkType(body);
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
    async updatePreference(req, res) {
        const connection = await dbConnection.createConnection();
        const { body } = req;
        try {
            const accessCodeUser = body.access_code;
            const accessCodeDB = await getPostById(req.params.userId, connection);
            let successfulData = [];
            let errorsData = [];

            if (accessCodeUser === accessCodeDB.access_code) {
                let checkSuccess = true;

                if (body.start_date != null) {
                    await connection.execute(`UPDATE tbl_53_preferences SET start_date= "${body.start_date}" WHERE access_code = "${accessCodeUser}"`);     
                    successfulData.push(`Start date updated to ${body.start_date}`);
                }

                if (body.end_date != null) {
                    await connection.execute(`UPDATE tbl_53_preferences SET end_date = "${body.end_date}" WHERE access_code = "${accessCodeUser}"`);     
                    successfulData.push(`End date updated to ${body.end_date}`);
                }

                if (body.destination != null) {
                    checkSuccess = await checkDestination(body);
                    if (!checkSuccess) {
                        errorsData.push(`Destination ${body.destination} is not in the list`);
                    } else {
                        await connection.execute(`UPDATE tbl_53_preferences SET destination = "${body.destination}" WHERE access_code = "${accessCodeUser}"`);     
                        successfulData.push(`Destination updated to ${body.destination}`);
                    }
                }

                if (body.type_vacation != null) {
                    checkSuccess = await checkType(body);
                    if (!checkSuccess) {
                        errorsData.push(`Vacation type ${body.type_vacation} is not in the list`);
                    } else {
                        await connection.execute(`UPDATE tbl_53_preferences SET type_vacation = "${body.type_vacation}" WHERE access_code = "${accessCodeUser}"`);     
                        successfulData.push(`Vacation type updated to ${body.type_vacation}`);
                    }        
                }

                if (successfulData.length > 0 || errorsData.length > 0) {
                    res.status(400).json({ success:`Successful Connection`, data: successfulData, error: errorsData});
                }   
            } else {
                res.status(400).json({ error: 'Access code doesnt match. Connection failed!' });
            }
        } catch(error) {
            res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
        connection.end();
    }
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
        if (body.type_vacation === tripData.types[i].type) {
            return true;
        }
    }
    return false;
}