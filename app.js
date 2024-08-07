require('dotenv').config({ path: '../.env' });
const replserver = require('./utils/replserver');
const whatsappService = require('./whatsapp/whatsappSocket');
const soket = require('./soket/webSocket');
const config = require('./config'); // Yapýlandýrma dosyasýný içe aktar

global.w = new Object();
replserver.start()
//cif (config.connectWhatsappOnStart) 
    whatsappService.start();


soket.start().then(() => {
    console.log("SignalR client started.");
}).catch(error => {
    console.error("Socket connection failed:", error);
});









