const db = require('mysql');
const pool = db.createPool({
    host : '23.229.191.136', // GoDaddy Shared Hosting
    user : 'alarm_pack', // Open for public
    password : 'dkffkadoq!', // Open for public
    database: 'alarm_pack'
});

var queryString = '';

function addNewUser(fuid, jdate, uname, callback) {
    pool.getConnection(function(error, connection) {
        if (error) {
            JSON.stringify(error, null, "\t");
        } else {
            var firebaseUID = fuid;
            var joinedDate = jdate;
            var username = uname;
            console.log("firebaseUID="+firebaseUID+" on database.js");
            queryString = `INSERT INTO user (FirebaseUID, JoinedDate, Username)
                            VALUES ("${firebaseUID}", STR_TO_DATE("${joinedDate}", "%Y-%m-%d"), "${username}");`;
            connection.query(queryString, function(error, results) {
                if(error) throw error;
                connection.release();
                callback(error, results);
            });
        }
    });
}

function getUserID(fuid, callback) {
	pool.getConnection(function(error, connection) {
		if (error) {
			JSON.stringify(error, null, "\t");
		} else {
			var firebaseUID = fuid;
			queryString = `SELECT UserID, Username FROM user
							WHERE FirebaseUID = "${firebaseUID}";`;
			connection.query(queryString, function(error, results) {
            	connection.release();
            	callback(error, results);
            });
		}
	});
}

// alarm list for the given packageID
function alarm(pid, uid, callback) {
    pool.getConnection(function(error, connection) {
        if (error) {
            JSON.stringify(error, null, "\t");
        } else {
            var packageID = pid;
            var userID = uid;
            queryString = `SELECT A.AlarmID, DATE_FORMAT(Time, "%h:%i %p") AS Time, A.Description, A.RepeatDay, A.Sound, A.Vibrate, A.Snooze, A.PackageID
                            FROM alarm A
                            JOIN package P ON A.PackageID = P.PackageID
                            WHERE A.PackageID = ${packageID}
                            AND P.UserID = ${userID}
                            GROUP BY A.AlarmID 
                            ORDER BY A.Time;`
            connection.query(queryString, function(error, results) {
                connection.release();
                callback(error, results);
            });
        }
    });
}

function popularPackages(callback) {
    pool.getConnection(function(error, connection) {
        if (error) { 
            JSON.stringify(error, null, "\t");
        } else {
            queryString = `SELECT P.PackageID, P.Description, P.LikeCount, P.ShareCount, SUM(P.LikeCount + P.ShareCount) AS TOTALCOUNT, P.UserID, U.Username, COUNT(A.AlarmID) AS AlarmCount
                            FROM package P
                            JOIN alarm A ON P.PackageID = A.PackageID
                            JOIN user U ON P.UserID = U.UserID
                            GROUP BY PackageID
                            ORDER BY TOTALCOUNT DESC 
                            LIMIT 10;`;
            connection.query(queryString, function(error, results) {
                connection.release();
                callback(error, results);
            });
        }  
    });
}

function packageSharedByUser(userID, callback) {
    pool.getConnection(function(error, connection) {
        if (error) { 
            JSON.stringify(error, null, "\t");
        } else {
            const id = userID;
            queryString = `SELECT P.PackageID, P.Description, P.LikeCount, P.ShareCount, U.UserID, U.Username, SUM(P.LikeCount + P.ShareCount) AS TOTALCOUNT, COUNT(A.AlarmID) AS AlarmCount
                            FROM package P
                            JOIN alarm A ON (P.PackageID = A.PackageID AND P.UserID = A.UserID)
                            JOIN user U ON P.UserID = U.UserID
                            WHERE U.UserID = ${id}
                            GROUP BY PackageID 
                            ORDER BY TOTALCOUNT DESC;`
            connection.query(queryString, function(error, results) {
                connection.release();
                callback(error, results);
            });
        }  
    });
}

function search(keyword, callback) {
    pool.getConnection(function(error, connection) {
        if (error) { 
            JSON.stringify(error, null, "\t");
        } else {
            const key = keyword
            queryString = `SELECT P.PackageID, P.Description, P.LikeCount, P.ShareCount, P.UserID, U.Username, COUNT(A.AlarmID) AS AlarmCount
                            FROM package P
                            JOIN user U ON P.UserID = U.UserID
                            JOIN alarm A ON P.PackageID = A.PackageID
                            WHERE INSTR(P.Description, "${key}") > 0
                            OR INSTR(U.Username, "${key}") > 0
                            GROUP BY P.PackageID;`;
            connection.query(queryString, function(error, results) {
                connection.release();
                callback(error, results);
            });
        }  
    });
}


function addNewPackage(time, alarmDesc, repeat, sound, vibrate, snooze, pDesc, uID, callback) {
    pool.getConnection(function(error, connection) {
        if (error) { 
            JSON.stringify(error, null, "\t");
        } else {
            const packageDescription = pDesc
            const userID = uID;

            const alarmTime = time
            const alarmDescription = alarmDesc
            const alarmRepeat = repeat
            const alarmSound = sound
            const alarmVibrate = vibrate
            const alarmSnooze = snooze
            var packageID = 0;

            queryString = `INSERT INTO package (Description, LikeCount, ShareCount, UserID, CreatedDate)
                            VALUES ("${packageDescription}", 0, 0, ${userID}, current_timestamp());`;
            connection.query(queryString, function(error, results) {
                queryString = `SELECT COALESCE(MAX(PackageID),0) AS PID FROM package
                                WHERE UserID = ${userID};`;
                connection.query(queryString, (error, results) => {
                    console.log(JSON.stringify(results, null, "\t"));

                    // GET UPDATED packageID AND PASS IT TO THE NEXT QUERY
                    packageID = results[0].PID

                    callback(error, results);

                    queryString = `INSERT INTO alarm (Time, Description, RepeatDay, Sound, Vibrate, Snooze, PackageID, UserID)
                                    VALUES ("${alarmTime}", "${alarmDescription}", "${alarmRepeat}", "${alarmSound}", 
                                    ${alarmVibrate}, ${alarmSnooze}, ${packageID}, ${userID});`;

                    connection.query(queryString, (error, result) => {
                        console.log(JSON.stringify(result, null, "\t"));
                        console.log(JSON.stringify(error, null, "\t"));
                        connection.release();
                    });
                    
                });
            });
        } 
    });
}

function addNewAlarm(time, alarmDesc, repeat, sound, vibrate, snooze, pID, uID, callback) {
	pool.getConnection(function(error, connection) {
        if (error) { 
            JSON.stringify(error, null, "\t");
        } else {
        	const alarmTime = time
        	const alarmDescription = alarmDesc
        	const alarmRepeat = repeat
        	const alarmSound = sound
        	const alarmVibrate = vibrate
        	const alarmSnooze = snooze
            const packageID = pID
            const userID = uID
            queryString = `INSERT INTO alarm (Time, Description, RepeatDay, Sound, Vibrate, Snooze, PackageID, UserID)
							VALUES ("${alarmTime}", "${alarmDescription}", "${alarmRepeat}", "${alarmSound}", ${alarmVibrate}, ${alarmSnooze}, ${packageID}, ${userID});`;
            connection.query(queryString, function(error, results) {
                connection.release();
                callback(error, results);
            });
        }  
    });
} 

function likeUp(pID, uID, callback) {
    pool.getConnection(function(error, connection) {
        if (error) { 
            JSON.stringify(error, null, "\t");
        } else {
            const packageID = pID
            const userID = uID
            queryString = `UPDATE package
                            SET LikeCount = LikeCount+1
                            WHERE PackageID = ${packageID}
                            AND UserID = ${userID};`;
            connection.query(queryString, function(error, results) {
                connection.release();
                callback(error, results);
            });
        }  
    });
} 

function likeDown(pID, uID, callback) {
    pool.getConnection(function(error, connection) {
        if (error) { 
            JSON.stringify(error, null, "\t");
        } else {
            const packageID = pID
            const userID = uID
            queryString = `UPDATE package
                            SET LikeCount = LikeCount-1
                            WHERE PackageID = ${packageID}
                            AND UserID = ${userID};`;
            connection.query(queryString, function(error, results) {
                connection.release();
                callback(error, results);
            });
        }  
    });
} 

function shareUp(pID, uID, callback) {
    pool.getConnection(function(error, connection) {
        if (error) { 
            JSON.stringify(error, null, "\t");
        } else {
            const packageID = pID
            const userID = uID
            queryString = `UPDATE package
                            SET ShareCount = ShareCount+1
                            WHERE PackageID = ${packageID}
                            AND UserID = ${userID};;`;
            connection.query(queryString, function(error, results) {
                connection.release();
                callback(error, results);
            });
        }  
    });
}

module.exports = {alarm, popularPackages, packageSharedByUser, search, addNewUser, getUserID, addNewPackage, addNewAlarm, likeUp, likeDown, shareUp};