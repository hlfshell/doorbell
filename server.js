//Load env vars if done by file - otherwise assume that it will be set in environment variables 
var fs = require('fs');
if(fs.existsSync('./.env')) require('dotenv').config();

var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

var contacts = require('./contact.json');

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
        res.sendFile(path.join(process.env.PHOTOS_FOLDER, req.params.image));
    }
);

//Accepting an SMS from twilio 
app.get(
    "/sms/received"
    function(req, res, next){
        //Is this actually from twilio?
        
    }
);

//Load the daemon
var Daemon = require('./daemon.js');
var Camera = require('./camera.js');

var camera = new Camera();

var daemon = new Daemon({ camera: camera });

daemon.watch();

app.listen(process.env.PORT);
