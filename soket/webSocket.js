require('dotenv').config({ path: '../../.env' });
const whatsappService = require('../whatsapp/whatsappSocket');
const SignalRClient = require('./signalRClient');
const config = require('../config');

const user = {
    Id: config.websocket.userId,
    firmId: config.websocket.firmId,
    roleId: config.websocket.roleId
};

const soket = new SignalRClient({
    serverUrl: process.env.WEBSOCKET_SERVER || config.websocket.serverUrl,
    hubs: [process.env.HUB_NAME || config.websocket.hubName],
    startLater: true,
    reconnectRetryDelayMs: 5000,
    hearthbeatInterval: 30000,
    queryString: {
        user: JSON.stringify(user)
    }
});
;
soket.client.serviceHandlers.connected = async (connection) => {
    soket.eventTrigger('connected', null, connection);


};

soket.client.on(soket.hubNames[0], 'clientsStatus', (message,id,connectedClients) => {
    console.log('clientsStatus:', message, id,connectedClients);
});

soket.client.on(soket.hubNames[0], 'processCommand', (request) => {
    console.log('clientsStatus:', request);
});



soket.client.serviceHandlers.messageReceived = (message) => {
    //soket.messageReceived(message);
    return false;
};


soket.messageReceived = (message) => {
    if (message.utf8Data === "{}") return;
    console.log("Message received: ", message);

};

soket.processCommands = async (command) => {
    console.log("Incoming command: ", command);

};





module.exports = soket;
