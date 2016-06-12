"use strict"

var GPIO = require('onoff').Gpio;

var Ring = require('./ring.js');

const LOW = 0;
const HIGH = 1;

class Daemon{
    
    /*
        {
            camera: camera,
            trigger: triggerFnc
         }
    
    */
    constructor(opts){
        this._ring = new Ring(opts);
        
        this._button = new GPIO(process.env.BUTTON_GPIO, 'in', 'falling');
        this._led = new GPIO(process.env.LED_GPIO, 'out');
        
        this._led.write(HIGH);
    }
    
    get ring(){ return this._ring; }
    
    get button(){ return this._button; }
    
    get led() { return this._led }
    
    blinkLED(times, delay){
        var self = this;
        var ledValue = LOW;
        
        self.led.write(ledValue);
        
        var blinkCount = times - 1;
        var blinkInterval = setInterval(function(){
            
            if(ledValue == LOW){
                ledValue = HIGH;
                if(blinkCount <= 0) clearTimeout(blinkInterval);
            } else {
                ledValue = LOW;
                blinkCount--;
            }
            
            self.led.write(ledValue);
            
        }, delay);
    }
    
    manuallyTrigger(){
        self.ring.trigger();
    }
    
    watch(){
        var self = this;
        self._button.watch(function(err, value){
            //We only react to the button press, not the release - avoid double firing
            if(value == LOW) return;
            
            //If the ringing occured too soon, don't ring again!
            if(!self.ring.canRing) return
            
            self.blinkLED(3, 300);
            self.ring.trigger();
        });
    }
}

module.exports = Daemon;