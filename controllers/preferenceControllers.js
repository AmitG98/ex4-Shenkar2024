const { v4: uuidv4 } = require('uuid');
const { dbConnection } = require('../db_connection');
const tripData = require('../data/records.json');

exports.preferenceControllers = {
    async addPreference(req, res) {
        const connection = await dbConnection.createConnection();
        const { body } = req;
        try {
            await connection.execute(`SET time_zone = '+03:00';`);
            const accessCodeUser = body.access_code;
            const accessCodeDB = await getAccessCodeById(req.params.userId, connection);

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
                        checkSuccess = await checkDates(body.start_date, body.end_date);
                        if (!checkSuccess) {
                            res.status(400).json({ error:'The length of the vacation cannot be more than a week' });
                        } else {
                            await connection.execute(`INSERT INTO tbl_53_preferences (id,access_code,start_date,end_date,destination,type_vacation,timeStamp) VALUES ("${req.params.userId}","${accessCodeUser}","${body.start_date}","${body.end_date}","${body.destination}","${body.type_vacation}",now())`);
                            res.status(201).json({ success: `Successful connection and preferences added!` });
                        }
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
            await connection.execute(`SET time_zone = '+03:00';`);
            const accessCodeUser = body.access_code;
            const accessCodeDB = await getAccessCodeById(req.params.userId, connection);
            let successfulData = [];
            let errorsData = [];

            if (accessCodeUser === accessCodeDB.access_code) {
                let checkSuccess = true;

                if (body.start_date != null || body.end_date != null) {
                    if (body.start_date != null && body.end_date != null) {
                        await updateFullDate(body,errorsData,successfulData,accessCodeUser,connection);
                    }
                    else if (body.start_date != null && body.end_date == null) {
                        await updateStartDate(body,errorsData,successfulData,accessCodeUser,connection);
                    }
                    else {
                        await updateEndDate(body,errorsData,successfulData,accessCodeUser,connection);
                    }
                }

                if (body.destination != null) {
                    checkSuccess = await checkDestination(body);
                    if (!checkSuccess) {
                        errorsData.push(`Destination ${body.destination} is not in the list`);
                    } else {
                        await connection.execute(`UPDATE tbl_53_preferences SET destination = "${body.destination}", timeStamp = now() WHERE access_code = "${accessCodeUser}"`);     
                        successfulData.push(`Destination updated to ${body.destination}`);
                    }
                }

                if (body.type_vacation != null) {
                    checkSuccess = await checkType(body);
                    if (!checkSuccess) {
                        errorsData.push(`Vacation type ${body.type_vacation} is not in the list`);
                    } else {
                        await connection.execute(`UPDATE tbl_53_preferences SET type_vacation = "${body.type_vacation}", timeStamp = now() WHERE access_code = "${accessCodeUser}"`);     
                        successfulData.push(`Vacation type updated to ${body.type_vacation}`);
                    }        
                }

                if (successfulData.length > 0 || errorsData.length > 0) {
                    res.status(201).json({ success:`Successful Connection`, data: successfulData, error: errorsData});
                }   
            } else {
                res.status(400).json({ error: 'Access code doesnt match. Connection failed!' });
            }
        } catch(error) {
            res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
        connection.end();
    },
    async getPreferences(req, res) {
        const connection = await dbConnection.createConnection();
        try {
            const prefer = await getPostById(req.params.userId, connection);
            res.status(200).json({ data: { Destination:prefer.destination, type: prefer.type_vacation, dates: `${prefer.start_date} until ${prefer.end_date}` }});
        
        } catch(error) {
            res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
        connection.end();
    },
    async getResults(req, res) {
        const connection = await dbConnection.createConnection();
        try {
            const preferences = await getPreferencesofGroup(connection);
            if (preferences.length !== 5) {
                res.status(400).json({ error: `Wait for everyone's preferences`});
                return;
            }

            const resultDest = await checkResultDestOrType(preferences, 'destination');
            const resultType = await checkResultDestOrType(preferences, 'type_vacation');
            const resultDate = await checkResultDates(preferences);
            res.status(201).json({ data: `the selected vacation is: ${resultDest} with type of ${resultType} on the dates ${resultDate.start_date} until ${resultDate.end_date}`});
        } catch(error) {
            res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
        connection.end();
    }
};

async function getAccessCodeById(userId, connection) {
    const [rows] = await connection.execute(`SELECT * FROM tbl_53_users WHERE id =${userId}`);
    return rows[0];
}

async function getPostById(userId, connection) {
    const [rows] = await connection.execute(`SELECT * FROM tbl_53_preferences WHERE id =${userId}`);
    return rows[0];
}

async function getPostByAccessCode(accessCode, connection) {
    const [rows] = await connection.execute(`SELECT * FROM tbl_53_preferences WHERE access_code = "${accessCode}"`);
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

async function checkDates(startDate, endDate) {
    const parts = startDate.split('-');
    const dayStart = parseInt(parts[0], 10);
    const monthStart = parseInt(parts[1], 10);
    const yearStart = parseInt(parts[2], 10);

    const parts2 = endDate.split('-');
    const dayEnd = parseInt(parts2[0], 10);
    const monthEnd = parseInt(parts2[1], 10);
    const yearEnd = parseInt(parts2[2], 10);

    const start = new Date(yearStart,monthStart,dayStart);
    const end = new Date(yearEnd,monthEnd,dayEnd);

    const timeDifference = end - start;
    const dayDifference = timeDifference / (1000 * 60 * 60 * 24);
    if (dayDifference > 7 || dayDifference < 0) {
        return false;
    }
    return true;
}

async function updateFullDate(body, errorsData, successfulData, accessCode, connection) {
    let checkSuccess = await checkDates(body.start_date, body.end_date);
    if (!checkSuccess) {
        errorsData.push(`The length of the vacation cannot be more than a week`);
    } else {
        await connection.execute(`UPDATE tbl_53_preferences SET start_date= "${body.start_date}", end_date="${body.end_date}", timeStamp = now() WHERE access_code = "${accessCode}"`);     
        successfulData.push(`Start-date and end-date updated to ${body.start_date} - ${body.end_date}`);
    }
}

async function updateStartDate(body, errorsData, successfulData, accessCode, connection) {
    const selectedRow = await getPostByAccessCode(accessCode, connection);
    let checkSuccess = await checkDates(body.start_date, selectedRow.end_date);
    if (!checkSuccess) {
        errorsData.push(`The length of the vacation cannot be more than a week`);
    } else {
        await connection.execute(`UPDATE tbl_53_preferences SET start_date= "${body.start_date}", timeStamp = now() WHERE access_code = "${accessCode}"`);     
        successfulData.push(`Start date updated to ${body.start_date}`);
    }
}

async function updateEndDate(body, errorsData, successfulData, accessCode, connection) {
    const selectedRow = await getPostByAccessCode(accessCode, connection);
    let checkSuccess = await checkDates(selectedRow.start_date, body.end_date);
    if (!checkSuccess) {
        errorsData.push(`The length of the vacation cannot be more than a week`);
    } else {
        await connection.execute(`UPDATE tbl_53_preferences SET end_date = "${body.end_date}" WHERE access_code = "${accessCode}"`);     
        successfulData.push(`End date updated to ${body.end_date}`);
    }
}

async function getPreferencesofGroup(connection) {
    const [rows] = await connection.execute(`SELECT * FROM tbl_53_preferences`);
    return rows;
}

function parseTimestamp(timestamp) {
    const [datePart, timePart] = timestamp.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hour, minute, second] = timePart.split(':');
    return new Date(year, month - 1, day, hour, minute, second);
}

async function checkResultDestOrType(preferences, property) {
    const preferCount = {};
    let earliestPreference = preferences[0];

    for (const pref of preferences) {
        const value = pref[property];

        if (preferCount[value]) {
            preferCount[value]++;
        } else {
            preferCount[value] = 1;
        }
    }
    let resultPrefer = null;
    let maxCount = 0;

    for (const [value, count] of Object.entries(preferCount)) {
        if (count > maxCount) {
            maxCount = count;
            resultPrefer = value;
        }
    }

    let earliest = parseTimestamp(earliestPreference.timeStamp);
    if (maxCount == 1) {
        for (const pref of preferences) {
            const parsedTimestamp = parseTimestamp(pref.timeStamp);
            if (new Date(parsedTimestamp) < new Date(earliest)) {
                earliestPreference = pref;
                earliest = parseTimestamp(earliestPreference.timeStamp);
            }
        }
        return earliestPreference[property];
    }
    return resultPrefer;
}

function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

async function checkResultDates(preferences) {
    let earliestPreference = preferences[0];
    let latestStartDate = parseDate(preferences[0].start_date);
    let earliestEndDate = parseDate(preferences[0].end_date);

    for (const pref of preferences) {
        const startDate = parseDate(pref.start_date);
        const endDate = parseDate(pref.end_date);

        if (startDate > latestStartDate) {
            latestStartDate = startDate;
        }
        if (endDate < earliestEndDate) {
            earliestEndDate = endDate;
        }

        let earliest = parseTimestamp(earliestPreference.timeStamp);
        if (latestStartDate > earliestEndDate) {
            for (const pref of preferences) {
                const parsedTimestamp = parseTimestamp(pref.timeStamp);
                if (new Date(parsedTimestamp) < new Date(earliest)) {
                    earliestPreference = pref;
                    earliest = parseTimestamp(earliestPreference.timeStamp);
                }
            }
            console.log(earliestPreference);

            return earliestPreference;

        }
    }
    const start = formatDate(latestStartDate);
    const end = formatDate(earliestEndDate);
    return { start_date:start, end_date:end };
}

function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}
