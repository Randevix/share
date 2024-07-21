const signalR = require('signalr-client');
const config = require('../config');
const whatsappHandlers = require('../handlers/whatsappHandlers');

class SignalRClient {
    constructor(myConnection) {
        this.client = new signalR.client(myConnection.serverUrl, myConnection.hubs, 10, myConnection.startLater);
        this.client.queryString = myConnection.queryString;
        this.client.hearthbeatInterval = myConnection.hearthbeatInterval;
        this.client.reconnectRetryDelayMs = myConnection.reconnectRetryDelayMs;
        this.bindHandlers();
        this.hubNames = myConnection.hubs
    }

    async start() {
        this.client.start();
    }

    bindHandlers() {
        this.client.serviceHandlers = {
            bound: () => {
                this.eventTrigger('bound');
            },
            connected: async (connection) => {
                this.eventTrigger('connected', null, connection);
            },
            disconnected: () => {
                this.eventTrigger('disconnected', new Error('Disconnected'));
            },
            reconnected: (connection) => {
                this.eventTrigger('reconnected', null, connection);
            },
            connectFailed: (error) => {
                this.eventTrigger('connectFailed', error);
            },
            onerror: (error) => {
                this.eventTrigger('error', error);
            },
            bindingError: (error) => {
                this.eventTrigger('bindingError', error);
            },
            connectionLost: (error) => {
                this.eventTrigger('connectionLost', error);
            },
            reconnecting: (retry) => {
                this.eventTrigger('reconnecting', null, { retry });
                return true;
            },

        };
    }

    eventTrigger(type, error = null, callBackData = null) {
        const event = { type, error, data: callBackData };

        if (event.type === "connected") {
            this.startHeartbeat(this.client.hearthbeatInterval);
            if (config.debug) {
                console.log(`Soket Event: ${event.type}`);
                global.w.connection = event.data;
                global.w.soket = this.client;
            }
            return;
        }

        if (config.debug) console.log(`Soket Event : ${event.type}`, event);
        if (event.error) { this.reconnect(); return }

    }

    reconnect(delay = 5000) {
        if (this.client.reconnectTimeout) { clearTimeout(this.client.reconnectTimeout); }
        this.client.reconnectTimeout = setTimeout(() => {
            console.log("Trying to reconnect...");
            this.client.start();
        }, Math.max(this.client.reconnectRetryDelayMs || delay));
    }

    startHeartbeat(interval) {
        if (!interval) return;
        if (this.client.hbInterval) { clearInterval(this.client.hbInterval); }
        this.client.hbInterval = setInterval(() => {
            try {
                this.client.call(this.client.hubs[0], 'Heartbeat');
                console.log('Heartbeat successful');
            } catch (err) {
                console.log('Heartbeat failed');
                this.client.start();
            }
        }, Math.max(interval, 30000));
    }


}

module.exports = SignalRClient;
