const express = require('express');
const session = require('express-session');
const app = express();
const port = 7770; 

const router = express.Router();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());


app.use(session({
    secret : ['dkanrjsk'],
    name : "alarmSession",
    saveUninitialized : false,
    resave : false,
    cookie : { expires : 3600000 }
}));

const dbTestMaster = require('./database');

app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});

app.get('/', function(req, res) {
	console.log("hello Wake Up Together Server!")
    res.send("hello Wake Up Tegether")
});

// User Login
app.get('/userLogin', function(req, res) {
    console.log('Hello, world!');
    dbTestMaster.user((error, result) => {
        if (error) {
            console.log(JSON.stringify(error, null, "\t"));
        } else {
            res.send(result);
            console.log(result[0]['id']);
            console.log(result[0]['username']);
            console.log(result[0]['password']);
            console.log(result[0]['email']);
        }
    });
});

// Register new user
app.post('/userRegister', (req, res) => {
	console.log("userRegister")
	const firebaseUID = req.body.firebaseUID;
	const joinedDate = req.body.joinedDate;
	const username = req.body.username;
	
	console.log("firebaseUID="+firebaseUID+" on index.js");
	dbTestMaster.addNewUser(firebaseUID, joinedDate, username, (error, result) => {
		if(error) {
            console.log(JSON.stringify(error, null, "\t"));
        } else {
            console.log(JSON.stringify(result, null, '\t'));
            res.send(result);
        }
	});
});

app.get('/getUserByFUID/:fuid', (req, res) => {
	const id = req.params.fuid;
	dbTestMaster.getUserID(id, (error, result) => {
        if(error) {
            console.log(JSON.stringify(error, null, "\t"));
        } else {
            console.log(JSON.stringify(result, null, '\t'));
            res.send(result);
        }
    });
});

app.get('/alarm/:packageID/:userID', function(req, res) {
    // TO-DO : check user session ???
    // session contains Firebase ID ???
    const pid = req.params.packageID;
    const uid = req.params.userID;
    console.log('\n\n\n\n\nHello, alarm!');
    dbTestMaster.alarm(pid, uid, (error, result) => {
        if(error) {
            console.log(JSON.stringify(error, null, "\t"));
        } else {
            console.log(JSON.stringify(result, null, '\t'));
            res.send(result);
        }
    });
});


// Get user's shared package list (packages created by the user and shared)
// Param : userId
app.get('/packageSharedByUser/:userID', function(req, res) {
	const id = req.params.userID;
    // TO-DO : check user session
    // session contains Firebase ID
    dbTestMaster.packageSharedByUser(id, (error, result) => {
        if(error) {
            console.log(JSON.stringify(error, null, "\t"));
        } else {
            console.log(JSON.stringify(result, null, '\t'));
            res.send(result);
        }
    });
});

app.post('/packageAddNew', (req, res) => {
    // TO-DO : check user session
    // session contains Firebase ID

    const packageDescription = req.body.pDesc;
    const userID = req.body.uid;

    const alarmTime = req.body.time
    const alarmDescription = req.body.alarmDesc
    const alarmRepeat = req.body.repeat
    const alarmSound = req.body.sound
    const alarmVibrate = req.body.vibrate
    const alarmSnooze = req.body.snooze

    dbTestMaster.addNewPackage(alarmTime, alarmDescription, alarmRepeat, alarmSound, alarmVibrate, alarmSnooze, packageDescription, userID, (error, result) => {
        if (error) {
            console.log(JSON.stringify(error, null, "\t"));
        } else {
            console.log("on packageAddNew2");
            console.log(JSON.stringify(result, null, '\t'));
            res.send(result);
        }
    });
});

// Add an alarm to an existing package
// Param : {alarm information, including package Id}
app.post('/alarmAddNew', (req, res) => {
    // TO-DO : check user session
    // session contains Firebase ID
    
    const alarmTime = req.body.time
    const alarmDescription = req.body.alarmDesc
    const alarmRepeat = req.body.repeat
    const alarmSound = req.body.sound
    const alarmVibrate = req.body.vibrate
    const alarmSnooze = req.body.snooze
    const packageID = req.body.pID;
    const userID = req.body.uID;

    dbTestMaster.addNewAlarm(alarmTime, alarmDescription, alarmRepeat, alarmSound, alarmVibrate, alarmSnooze, packageID, userID, (error, result) => {
        if (error) {
            console.log(JSON.stringify(error, null, "\t"));
        } else {
            console.log(JSON.stringify(result, null, '\t'));
            res.send(result); 
        }
    });
});

// Increase like count of the given package
// Param : package Id, current user Id
app.post('/liked', (req, res) => {
    // TO-DO : check user session
    // session contains Firebase ID
    const pID = req.body.packageID;
    const uID = req.body.userID;
    
    dbTestMaster.likeUp(pID, uID, (error, result) => {
        if(error) {
            console.log(JSON.stringify(error, null, "\t"));
        } else {
            console.log(JSON.stringify(result, null, '\t'));
            res.send(result);
        }
    });
});

app.post('/likeCanceled', (req, res) => {
    const pID = req.body.packageID;
    const uID = req.body.userID;
    
    dbTestMaster.likeDown(pID, uID, (error, result) => {
        if(error) {
            console.log(JSON.stringify(error, null, "\t"));
        } else {
            console.log(JSON.stringify(result, null, '\t'));
            res.send(result); 
        }
    });
});

// Increase share count of the given package (param: packageId, current userId)
// Param : package Id, current user Id
app.post('/share', (req, res) => {
    // TO-DO : check user session
    // session contains Firebase ID
    const pID = req.body.packageID;
    const uID = req.body.userID;
    
    dbTestMaster.shareUp(pID, uID, (error, result) => {
        if(error) {
            console.log(JSON.stringify(error, null, "\t"));
        } else {
            console.log(JSON.stringify(result, null, '\t'));
            res.send(result); 
        }
    });
});

// Search packages by Username or Package Description
// Param : search type(username / description), keyword
app.get('/search/:keyword', (req, res) => {
	const key = req.params.keyword;
	dbTestMaster.search(key, (error, result) => {
        if(error) {
            console.log(JSON.stringify(error, null, "\t"));
        } else {
            console.log(JSON.stringify(result, null, '\t'));
            res.send(result);
        }
    });
});

// Popular alarm packages (top 10 alarm packages on the initial search page)
// Param : None
app.get('/popularPackages', function(req, res) {
    dbTestMaster.popularPackages((error, result) => {
        if(error) {
            console.log(JSON.stringify(error, null, "\t"));
        } else {
            console.log(JSON.stringify(result, null, '\t'));
            res.send(result);
        }
    });
});

// Edit package (ex. package descrition.... except the alarm contents)
// Param : {package information}
app.post('/packageUpdate', (req, res) =>{
    // TO-DO : check user session
    // session contains Firebase ID
});

// Delete (stop sharing) an existing package
// Param : package Id
app.post('/packageDelete', (req, res) =>{
    // TO-DO : check user session
    // session contains Firebase ID
});

// Edit exsiting alarm
// Param : {alarm information, including package Id}
app.post('/alarmUpdate', (req, res) =>{
    // TO-DO : check user session
    // session contains Firebase ID
});

// Delete (set the hidden flag) an alarm from a package
// Param : {alarm information, including package Id}
app.post('/alarmDelete', (req, res) =>{
    // TO-DO : check user session
    // session contains Firebase ID
});

// Close user account
app.get('/userCloseAccount', (req, res) => {

});

app.post('/userCloseAccount', (req, res) => {

});