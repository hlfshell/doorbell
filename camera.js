"use strict"

var PiCamera = require('camerapi');
var path = require('path');
var flow = require('async').waterfall;

class Camera{
    
    constructor(){
        this._takingPicture = false;
        this._piCam = new PiCamera();
        
        var cameraOptions =
            {
                timeout: 1000,
                width: 1280,
                height: 720,
                quality: 100
            };
            
        if(process.env.HORIZONTALLY_FLIP_PICTURE) cameraOptions.hflip = " ";
        if(process.env.VERTICALLY_FLIP_PICTURE) cameraOptions.vflip = " ";
        
        this._piCam.prepare(cameraOptions);
    }
    
    get piCam(){
        return this._piCam;
    }
    
    get takingPicture(){
        return this._takingPicture;
    }
    
    set takingPicture(taking){
        this._takingPicture = taking;
    }
    
    _waitForCamera(cb){
        var self = this;
        if(!self.takingPicture) return cb();
        
        setTimeout(function(){
            setImmediate(function(){
               self.waitForCamera(cb); 
            });
        }, 100);
    }
    
    _snapPicture(cb){
        var self = this;
        var now = new Date();
        var filename = now.getTime() + '.jpg';
        var filePath = path.join(process.env.PHOTOS_FOLDER, filename);
        
        self.piCam.takePicture(filePath, function(file, err){
           cb(err, filename); 
        });
    }
    
    takePicture(cb){
        var self = this;
        
        flow(
            [
               function(done){
                   self._waitForCamera(done);
               },
               function(done){
                   self._snapPicture(done);   
               }
            ],
            cb
        );
    }
    
}

module.exports = Camera;