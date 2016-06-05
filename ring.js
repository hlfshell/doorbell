var flow = require('async').waterfall;
var each = require('async').each;
var twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
var contacts = require('./contacts.json');
var fs = require('fs');

class Ring {
    
    constructor(opts){
        this._camera = opts.camera;
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
        
    }
    
    _sendTexts(imageName, cb){
        each(
            contacts,
            function(contact, done){
                twilio.sendMessage(
                  {
                    to: contact.phone,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    mediaUrl: process.env.AWS_S3_PUBLIC_URLL + '/' + imageName 
                  },
                  done
                );
            },
            cb
        );
    }
    
    trigger(cb){
        var self = this;
        
        if(!cb) cb = function(){};
        
        if(!self.canRing) return;
        
        self.lastPressed = true;
        
        //Take a picture
        flow(
            [
                self.camera.takePicture,
                self._sendTexts
            ],
            cb
        )
        
    }
    
}

module.exports = Ring;