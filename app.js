var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var fs = require("fs");
var FCM = require('fcm-push');
var serverKey = 'AIzaSyCHcTh-dPy_HFQCZQ4Se-wS45ABUrCZSws';
var fcm = new FCM(serverKey);
var azure = require('azure');
var notificationHubService = azure.createNotificationHubService('Test-Laybare-Hub','Endpoint=sb://test-laybare-hub.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=wXcb4hwKEpoDIYVUGn0ndM3MbtVRyIGnAGyY5igqVmo=');   

var app = express();
var __dirData ='/home/systemlaybare/public_html/node/apis/public/data/';
app.io = require('socket.io')();
app.io.set('origins', '*:*');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


//start listen with socket.io
app.io.on('connection', function(socket){
	console.log('connected');
  //refresh all appointments listed
  socket.on('refreshAppointments', function(branch_id, client_id){
    app.io.emit('refreshAppointments', {branch_id:branch_id, client_id:client_id});
  });

  //refresh specific appointment using id
  socket.on('refreshAppointment', function(id){
    app.io.emit('refreshAppointment', id);
  });

    //refresh specific branch using id
  socket.on('newMessage', function(recipient_id,sender_id){
    app.io.emit('newMessage', {recipient_id:recipient_id,sender_id:sender_id});
  });

  //refresh specific branch using id
  socket.on('refreshBranch', function(id){
    app.io.emit('refreshBranch', id);
  });

  socket.on('notifyTyping', function(recipient_id, sender_id){
    app.io.emit('notifyTyping', {recipient_id:recipient_id,sender_id:sender_id});
  });


  //refresh specific appointment using id
  socket.on('callItem', function(branch_id, item_id){
    app.io.emit('callItem', {branch_id:branch_id, item_id:item_id});
  });
});//end connection

app.use('/', index);
app.use('/users', users);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
