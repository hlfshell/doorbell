//Load env vars if done by file - otherwise assume that it will be set in environment variables 
var fs = require('fs');
if(fs.existsSync('./.env')) require('dotenv').config();

//Load the daemon
var Daemon = require('./daemon.js');
var Camera = require('./camera.js');

var camera = new Camera();

var daemon = new Daemon({ camera: camera });

//Now prepare the web server

var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

var contacts = require('./contacts.json');

//For serving up the image for the MMS portion
app.get(
    '/mms/:nonce/:image',
    function(req, res, next){
        fs.exists(path.join(process.env.NONCE_FOLDER, req.params.nonce), function(exists){
            if(!exists) return res.status(401).end();
            next();
        });
    },
    function(req, res, next){
        fs.unlink(path.join(process.env.NONCE_FOLDER, req.params.nonce), function(err){
           if(err) return res.status(401).end();
           next(); 
        });
    },
    function(req, res, next){
        fs.exists(path.join(process.env.PHOTOS_FOLDER, req.params.image), function(exists){
           if(!exists) return res.status(404).end();
           next(); 
        });
    },
    function(req, res, next){
        res.sendFile(path.join(process.env.PHOTOS_FOLDER, req.params.image), { root: __dirname });
    }
);

//Accepting an SMS from twilio 
/*
Example SMS:
{ ToCountry: 'US',
  ToState: 'PA',
  SmsMessageSid: 'somevalue',
  NumMedia: '0',
  ToCity: 'TYRONE',
  FromZip: '07930',
  SmsSid: 'somevalue',
  FromState: 'NJ',
  SmsStatus: 'received',
  FromCity: 'CHESTER',
  Body: 'Hey yo door bell how you ringin?',
  FromCountry: 'US',
  To: '+7325555555',
  ToZip: '16877',
  NumSegments: '1',
  MessageSid: 'somevalue',
  AccountSid: 'somevalue',
  From: '+19085555555',
  ApiVersion: '2010-04-01' }


*/
app.get(
    "/sms/received",
    function(req, res, next){
        var isAContact = false;
        contacts.forEach(function(contact){
            isAContact = isAContact || req.body.from.indexOf(from.contact.phone) != -1;
        });
        
        if(isAContact) return next();
        res.status(401).send();
    },
    //If we reach this point, trigger the ring
    function(req, res, next){
        daemon.ring.trigger(req.body.from);
    }
);

//Start the daemon
daemon.watch();

//Listen for web requests
app.listen(process.env.PORT);
console.log("Server is now listening for requests");
