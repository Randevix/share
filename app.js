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


soket.messageReceived = (message) => {
    if (message.utf8Data === "{}") return;
    console.log("Message received: ", message);

};

soket.incomingCommands = async (command) => {
    console.log("Incoming command: ", command);

};









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

