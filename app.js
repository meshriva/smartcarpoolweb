/*
 * Copyright 2014 IBM Corp. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger1 = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// binary encryption
var bcrypt =  require('bcrypt-nodejs');

// Queue
var Q = require('q');

//express session
var session = require('express-session');

//passport for authorization
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//IBM Blue mix
var ibmbluemix = require('ibmbluemix');
var ibmcloudcode = require('ibmcloudcode');
var ibmdata = require('ibmdata');;
var ibmpush = require('ibmpush');



//configuration for application
var appConfig = {
	applicationId: "445e9200-f6b5-4f61-8e86-d679dc9badd0",
	applicationRoute: "restmeshriva.mybluemix.net",
	applicationSecret:"726c5b4e326b90e10f529f58ab696beb55a88376"
};

//initialize mbaas-config module
ibmbluemix.initialize(appConfig);
var logger = ibmbluemix.getLogger();

var port = (process.env.VCAP_APP_PORT || 3001);

var notificationtags = require('./routes/notificationtags');
var users = require('./routes/users');
var circles = require('./routes/circles');
var circleUsers = require('./routes/circleUsers');
var trips = require('./routes/trips');
var tripUsers = require('./routes/tripUsers');


var index = require('./routes/index');
var login = require('./routes/login');
var services = require('./routes/services');
var updateUser = require('./routes/updateUser');
var currentTrips = require('./routes/currentTrips');
var searchTrips = require('./routes/searchTrips');
var createTrip = require('./routes/createTrip');
var manageCircles = require('./routes/manageCircles');

// create an express app
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger1('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({secret: 'shh its a secret', saveUninitialized: true,resave: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, '/public')));

//uncomment below code to protect endpoints created afterwards by MAS
//var mas = require('ibmsecurity')();
//app.use(mas);

app.use(function(req, res, next) {
	req.ibmpush = ibmpush.initializeService(req);
	req.cloudcode = ibmcloudcode.initializeService();
	req.data = IBMData.initializeService(req);
	req.logger = logger;
	var err = req.session.error,
		msg = req.session.notice,
		success = req.session.success;

	delete req.session.error;
	delete req.session.success;
	delete req.session.notice;

	if (err) res.locals.error = err;
	if (msg) res.locals.notice = msg;
	if (success) res.locals.success = success;
	next();
});



//initialize ibmconfig module
var ibmconfig = ibmbluemix.getConfig();

//get context root to deploy your application
//the context root is '${appHostName}/v1/apps/${applicationId}'
var contextRoot = ibmconfig.getContextRoot();
appContext=express.Router();
app.use(contextRoot, appContext);

console.log("contextRoot: " + contextRoot);

// log all requests
app.all('*', function(req, res, next) {
	console.log("Received request to " + req.url);
	next();
});

// end points for CRUD operations for Notification tags
// endpoint URL: https://mobile.ng.bluemix.net/restmeshriva/v1/apps/445e9200-f6b5-4f61-8e86-d679dc9badd0/tags

appContext.post('/tags',notificationtags.create);
appContext.get('/tags',notificationtags.getAll);
appContext.get('/tags/:taskname',notificationtags.getTagByName);
appContext.put('/tags/:taskname/:taskdescription',notificationtags.getTagDescription);
appContext.delete('/tags/:taskname',notificationtags.deleteTag);
appContext.post('/tags/sendMessageByTags',notificationtags.sendMessageByTags);
appContext.post('/tags/sendMessage',notificationtags.sendMessage);

// end points for operations related to users
// endpoint URL : https://mobile.ng.bluemix.net/${appHostName}/v1/apps/${applicationId}/users
appContext.get('/users/:email',users.getUser);
appContext.put('/users/:email',users.updateUser);
appContext.post('/users/auth',users.authenticate);

// end point for operations related to circles
// endpoint URL : https://mobile.ng.bluemix.net/${appHostName}/v1/apps/${applicationId}/circles
appContext.delete('/circles/:trustId',circles.delete);
appContext.post('/circles/create',circles.create);
appContext.post('/circles/find',circles.findCircles);

// end point for operations related to circleUsers
// endpoint URL : https://mobile.ng.bluemix.net/${appHostName}/v1/apps/${applicationId}/circleUsers
appContext.get('/circleUsers',circleUsers.getAllActive);
appContext.post('/circleUsers',circleUsers.create);
appContext.post('/circleUsers/find',circleUsers.customFind);
appContext.get('/circleUsers/:user',circleUsers.findByUser);
appContext.delete('/circleUsers/delete/:user/:trustId',circleUsers.deleteByUserAndTrustId);
appContext.delete('/circleUsers/delete/:trustId',circleUsers.deleteByTrustId);
appContext.post('/circleUsers/subscribe',circleUsers.subscribe);
appContext.get('/circleUsersPending/:user',circleUsers.findPendingEntriesByUser);
appContext.post('/circleUsersPending/updateStatus',circleUsers.updatePendingRequestStatus);

// end point for operations related to trips
// endpoint URL : https://mobile.ng.bluemix.net/${appHostName}/v1/apps/${applicationId}/trips
appContext.post('/trips',trips.create);
appContext.post('/trips/find',trips.find);
appContext.get('/trips/find/activeTrips/:user',trips.findActiveTripsByUser)

// end point for operations related to tripUsers
// endpoint URL : https://mobile.ng.bluemix.net/${appHostName}/v1/apps/${applicationId}/tripUsers
appContext.post('/tripUsers',tripUsers.create);
appContext.put('/tripUsers/update',tripUsers.updateStatus);
appContext.get('/tripUsers/:tripId',tripUsers.findByTripId);
appContext.post('/tripUsers/subscribe',tripUsers.subscribe);
appContext.post('/tripUsers/decision',tripUsers.decision);


// create resource URIs
// endpoint: https://mobile.ng.bluemix.net/${appHostName}/v1/apps/${applicationId}/notifyOtherDevices/
appContext.post('/notifyOtherDevices', function(req,res) {
	var results = 'Sent notification to all registered devices successfully.';

	console.log("Trying to send push notification via JavaScript Push SDK");
	var message = { "alert" : "The BlueList has been updated.",
					"url": "http://www.google.com"
	};

	req.ibmpush.sendBroadcastNotification(message,null).then(function (response) {
		console.log("Notification sent successfully to all devices.", response);
		res.send("Sent notification to all registered devices.");
	}, function(err) {
		console.log("Failed to send notification to all devices.");
		console.log(err);
		res.send(400, {reason: "An error occurred while sending the Push notification.", error: err});
	});
});


// host static files in public folder
// endpoint:  https://mobile.ng.bluemix.net/${appHostName}/v1/apps/${applicationId}/static/
appContext.use('/static', express.static('public'));

// home page of the site
app.get('/', index.home);

// sign in page
app.get('/signin',login.signin);

// sign up page
app.get('/signup',login.signup);

//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/login', passport.authenticate('local-signin', {
		successRedirect: '/',
		failureRedirect: '/signin'
	})
);

app.post('/local-reg', passport.authenticate('local-signup', {
		successRedirect: '/',
		failureRedirect: '/signup'
	})
);

// starting service page
app.get('/services',services.getServiceInfo);

// update user information page
app.get('/updateUser',updateUser.getUpdateUserPage);
app.post('/updateUser',updateUser.updateDetails);

// current trips
app.get('/currentTrips',currentTrips.getCurrentTrips);

app.get('/searchTrips',searchTrips.getSearchTripPage);
app.post('/searchTrips',searchTrips.getAvailableTrips);

app.get('/subscribe/:tripId/:trustId/:creator/:user/:status',searchTrips.subscribe);
app.post('/subscribeTrip',searchTrips.postSubscribeTrip);

app.get('/createTrip',createTrip.createTripPage);
app.post('/createTrip',createTrip.createTrip);

app.get('/manageCircles',manageCircles.showServicePage);
app.get('/manageCirclesSearch',manageCircles.showSearchOptions);
app.post('/manageCirclesSearch',manageCircles.searchCircles);
app.post('/manageCirclesSubscribe',manageCircles.postSubscribeCircle);
app.get('/manageCirclesSubscribe/:user/:name/:desc/:admin/:open/:active/:location/:trustId',manageCircles.subscribeCircle);
app.get('/manageCirclesPermission',manageCircles.showCirclePendingRequest);
app.post('/manageCirclesPermission',manageCircles.submitPermissionUpdate);
app.get('/manageCirclesCurrent',manageCircles.getCurrentCircles);
app.get('/manageCirclesCreate',manageCircles.showCreateCircle);
app.post('/manageCirclesCreate',manageCircles.createCircle);


//===============PASSPORT=================//

// Passport session setup.
passport.serializeUser(function(user, done) {
	console.log("serializing " + user.email);
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

//logs user out of site, deleting them from the session, and returns to homepage
app.get('/logout', function(req, res){
	var name = req.user.email;
	console.log("LOGGING OUT " + name);
	req.logout();
	res.redirect('/');
	req.session.notice = "You have successfully been logged out " + name + "!";
});

// Use the LocalStrategy within Passport to Register/"signup" users.
passport.use('local-signup', new LocalStrategy(
	{passReqToCallback : true}, //allows us to pass back the request to the callback
	function(req,username, password, done) {

		// for now switching the encryption off
		//var hash = bcrypt.hashSync(password);

		// get the data from request
		var data = req.data;
		console.log(req.body.email);

		//Create a user object
		var user = data.Object.ofType("User",{
			email:req.body.email,
			name: req.body.username,
			password: req.body.password,
			phoneNumber: req.body.phoneNumber,
			currentLocation: req.body.currentLocation,
			vechileRegisterationNumber: req.body.vechileNumber
		});

		user.save().then(function(savedUser) {
			if (savedUser != undefined && savedUser.attributes!=undefined ) {
				// person has been saved
				console.log(savedUser);
				req.session.success = 'You are successfully registered and logged in ' + username + '!';
				console.log("data is set in session");
				done(null,savedUser.attributes);
			}else{
				console.log("COULD NOT REGISTER");
				req.session.error = 'That username is already in use, please try a different one.'; //inform user could not log them in
				done(null,savedUser);
			}

		}),function(err){
			//handle errors
			console.log("Got an error while saving the message"+err);
			// done(err);
		}
	}
));

/// Use the LocalStrategy within Passport to login users.
passport.use('local-signin', new LocalStrategy(
	{passReqToCallback : true}, //allows us to pass back the request to the callback
	function(req, username, password, done) {

		// get cloudcode from req attribute
		var cloudcode = req.cloudcode;

		var payload = {
			email:username,
			password : password
		};

		// Invoke the Post Operation
		cloudcode.post("/users/auth",payload).then(function(response) {
			console.log(response);
			var res = JSON.parse(response);
			console.log("here"+res);
			if (res != undefined ) {
				console.log("Received response"+res.response);
				done(null, res.response);
			}else{
				console.log("Can't get response for authentication request");
				done(null, res)
			}
		},function(err){
			console.log(err);
			done(err);
		});
	}
));

// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	req.session.error = 'Please sign in!';
	res.redirect('/');
}

//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});



module.exports = app;
app.listen(ibmconfig.getPort());
console.log('Server started at port: '+ibmconfig.getPort());
