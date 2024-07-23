require('dotenv').config({ path: '../.env' });
const replserver = require('./utils/replserver');
const whatsappService = require('./whatsapp/whatsappSocket');
const soket = require('./soket/webSocket');
const config = require('./config'); // Yapýlandýrma dosyasýný içe aktar

global.w = new Object();
replserver.start()
whatsappService.start();



soket.start().then(() => {
    console.log("SignalR client started.");
}).catch(error => {
    console.error("Socket connection failed:", error);
});









//     soket.incomingCommands = (command) => {
//        console.log("Message from client: ", command);

//        let response;
//        try {
//            switch (command.type) {
//                case 'whatsapp':
//                  //  response = await whatsappHandlers[command.action](command.data);
//                    break;
//                default:
//                    response = { error: 'Invalid command type' };
//                    break;
//            }
//        } catch (error) {
//            response = { error: error.message };
//        }

//        this.client.call(this.client.hubs[0], 'toClient', response);
//    }

//}).catch(error => {
//    console.error("Socket connection failed:", error);
//});

