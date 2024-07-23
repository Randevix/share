const SignalRClient = require('./signalRClient');
const config = require('../config');

const signalRConfig = {
    serverUrl: config.websocket.serverUrl,
    hubs: [config.websocket.hubName],
    startLater: true,
    queryString: { userId: -1, clientName: "Nodi", waConStatus: "disconnected" }
};

const soket = new SignalRClient(signalRConfig);

soket.client.serviceHandlers.connected = async (connection) => {
    soket.eventTrigger('connected', null, connection);

    // connected olay�ndan sonra di�er dinleyicileri tan�mlay�n
    const hubName = config.websocket.hubName;

    soket.client.on(hubName, 'messageReceived', (message) => {
        soket.messageReceived(message);
    });

    soket.client.on(hubName, 'incomingCommands', async (command) => {
        await soket.incomingCommands(command);
    });
};

// messageReceived ve incomingCommands metodlar�n� soket nesnesinde tan�mlay�n
soket.messageReceived = (message) => {
    console.log("Message received: ", message);
    // Mesaj i�leme kodu buraya
};

soket.incomingCommands = async (command) => {
    console.log("Incoming command: ", command);
    // Komut i�leme kodu buraya
};

module.exports = soket;
