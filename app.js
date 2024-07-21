require('dotenv').config({ path: '../.env' });
const replserver = require('./utils/replserver');
const whatsappService = require('./whatsapp/whatsappSocket');
const SignalRClient = require('./soket/signalRClient');
const config = require('./config'); // Yapýlandýrma dosyasýný içe aktar
global.w = new Object();
replserver.start()
whatsappService.start();

const soket = new SignalRClient({
    serverUrl: process.env.WEBSOCKET_SERVER || config.websocket.serverUrl,
    hubs: [process.env.HUB_NAME || config.websocket.hubName],
    startLater: true,
    reconnectRetryDelayMs: 5000,
    hearthbeatInterval: 30000,
    queryString: { userId: -1, clientName: "Nodi", waConStatus: whatsappService.connection.status }
});


soket.client.on(soket.hubNames[0], 'clientsStatus', (message) => {
     console.log('clientsStatus:', message);
});


soket.client.serviceHandlers.connected = async (connection) => {
    soket.eventTrigger('connected', null, connection);
     // connected olayýndan sonra diðer dinleyicileri tanýmlayýn
 
};


soket.client.serviceHandlers.messageReceived = (message) => {
    soket.messageReceived(message);
    return false;
};




soket.start().then(() => {
    console.log("SignalR client started.");
}).catch(error => {
    console.error("Socket connection failed:", error);
});

// messageReceived ve incomingCommands metodlarýný soket nesnesinde tanýmlayýn
soket.messageReceived = (message) => {
    if (message.utf8Data === "{}") return;
     console.log("Message received: ", message);
    // Mesaj iþleme kodu buraya
};

soket.incomingCommands = async (command) => {
    console.log("Incoming command: ", command);
    // Komut iþleme kodu buraya
};









//soket.start().then(() => {

//    soket.client.servicehandler.messageReceived = (message) => {
//       console.log(message);
//       return false;
//    }



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

