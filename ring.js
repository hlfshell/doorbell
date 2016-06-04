var flow = require('async').waterfall;
var each = require('async').each;
var twilio = require('twilio');
var contact = require('./contacts.json');

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
    
    get canRing(){
        return this._lastPressed + 5000 < new Date().getTime();
    }
    
    sendTexts(imagePath, cb){
        each(
            contacts,
            function(done){
                
            },
            cb
        );
    }
    
    trigger(cb){
        var self = this;
        
        if(!cb) cb = function(){};
        
        if(!self.canRing) return;
        
        //Take a picture
        flow(
            [
                self.camera.takePicture,
                self.sendTexts
            ],
            cb
        )
        
    }
    
}

module.exports = Ring;