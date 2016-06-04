//Load env vars if done by file - otherwise assume that it will be set in environment variables 
var fs = require('fs');
if(fs.existsSync('./env')) require('dotenv').config();
