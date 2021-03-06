"use strict"

var flow = require('async').waterfall;
var each = require('async').each;
var twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
var contacts = require('./contacts.json');
var fs = require('fs');
var uuid = require('uuid').v4;
var path = require('path');

class Ring {
    
    constructor(opts){
        this._camera = opts.camera;
        this._lastPressed = 0;
    }
    
    get camera(){
        return this._camera;
    }
    
    set camera(camera){
        this._camera = camera;
    }
    
    get lastPressed(){
        return this._lastPressed;
    }
    
    set lastPressed(anything){
        this._lastPressed = new Date().getTime();
    }
    
    get canRing(){
        return this._lastPressed + 5000 < new Date().getTime();
    }
    
    _createNonce(cb){
        var nonce = uuid();
        fs.open(path.join(process.env.NONCE_FOLDER, nonce), 'w', function(err, fd){
            if(err) return cb(err);
            fs.close(fd, function(err){
                cb(err, nonce);
            });
        });
    }
    
    _sendMMS(imageName, phone, cb){
        var self = this;
        self._createNonce(function(err, nonce){
           twilio.sendMessage(
                {
                    to: phone,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    mediaUrl: process.env.MY_URL + '/mms/' + nonce + '/' + imageName 
                },
                cb
            ); 
        });
    }
    
    _sendTexts(imageName, phone, cb){
        var self = this;
        
        if(typeof phone == "function"){
            phone = null;
            cb = phone;
        }
        
        if(phone)
            self._sendMMS(imageName, phone, cb);
        else {
            var phones = [];
            contacts.forEach((contact)=> phones.push(contact.phone) );
            each(
                phones,
                function(phone, done){
                    self._sendMMS(imageName, phone, done);
                },
                cb
            );
        }
        
    }
    
    trigger(phone){
        var self = this;
        
        if(!self.canRing) return;
        
        self.lastPressed = true;
        
        //Take a picture
        flow(
            [
                function(done){
                    self.camera.takePicture(done);
                },
                function(image, done){
                    if(phone){
                     self._sendTexts(image, phone, done);
                    } else {
                     self._sendTexts(image, done);   
                    }
                }
            ],
            function(){
                //Do nothing
            }
        )
        
    }
    
}

module.exports = Ring;