//Load env vars if done by file - otherwise assume that it will be set in environment variables 
var fs = require('fs');
if(fs.existsSync('./.env')) require('dotenv').config();

var express = require('express');
var app = express();

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

//Temporary test endpoint
app.get('/:image', function(req, res){
    res.sendFile(path.join(process.env.PHOTOS_FOLDER, req.params.image));
});

//Load the daemon
var Daemon = require('./daemon.js');
var Camera = require('./camera.js');

var camera = new Camera();

var daemon = new Daemon({ camera: camera });

daemon.watch();


app.listen(process.env.PORT);
