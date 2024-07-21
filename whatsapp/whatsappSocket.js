
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeInMemoryStore, Browsers, keyed,
    MessageType, MessageOptions, Mimetype, downloadMediaMessage } = require('@whiskeysockets/baileys');
const pino = require('pino');
const { unlinkSync } = require('fs');
const config = require('../config'); // Yapýlandýrma dosyasýný içe aktar
const store = makeInMemoryStore({ logger: pino().child({ level: 'debug', stream: 'store' }), keyed: true });

class WhatsappService {
    constructor() {
        this.connection = { manualDisconnect: false, status: "close" };
        this.writeStoreOnConnectionLoss = false;
        this.reconnectTimeout = null; // Zamanlayýcýyý tanýmlayýn
    }

    async start() {
      
        const { state, saveCreds } = await useMultiFileAuthState(config.whatsapp.authPath)
        this.socket = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            logger: pino({ level: 60 }),
            version: [2, 2424, 6,0],
            browser: Browsers.macOS("Desktop"),
            syncFullHistory: true,
            store: store
        });
       
        this.bindEvents(saveCreds); // saveCreds'i buradan ilet
        this.loadStoreFromFile()
        return this.socket;
    }

    async reconnect() {
        if (!this.reconnectTimeout) {
            this.reconnectTimeout = setTimeout(async () => {
                await this.start();
                this.reconnectTimeout = null; // Zamanlayýcýyý sýfýrla
            }, config.whatsapp.reconnectTimeout); 
        }
    }

    bindEvents(saveCreds) {
        store.bind(this.socket.ev);
        this.socket.ev.on('creds.update', saveCreds); // Oturum bilgilerini güncelle
        this.socket.ev.on('connection.update', this.onConnectionUpdate.bind(this));
        this.socket.ev.on('chats.set', this.writeStoreToFile.bind(this));
        this.socket.ev.on('contacts.set', this.writeStoreToFile.bind(this));
        this.socket.ev.on('messages.upsert', this.handleMessage.bind(this));
        if(config.debug) global.w.whats = this;
    }

    onConnectionUpdate(update) {
        const { connection, lastDisconnect } = update;

        if (this.connection.manualDisconnect) {
               lastDisconnect.error = "From User Disconnected";
        }

        if (connection) {
            this.connection.status = connection;
            this.sendWhatsappStatus();
        }

        if (lastDisconnect) {
            this.connection.lastDisconnect = lastDisconnect;
        }

        console.log('Connection update:', update);

        if (connection === 'close' && !this.connection.manualDisconnect) {
            const shouldReconnect = (lastDisconnect.error === null || lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut);
            console.log('\n', 'Connection closed due to', lastDisconnect.error.message, ', reconnecting', shouldReconnect, '\n');
            if (shouldReconnect) {
                this.reconnect();
            } else {
                unlinkSync(config.whatsapp.authPath);
            }

            if (this.writeStoreOnConnectionLoss) {
                this.writeStoreToFile();
                this.writeStoreOnConnectionLoss = false;
            }
        } else if (connection === 'open') {
            this.writeStoreOnConnectionLoss = true;
        }
    }


    loadStoreFromFile() {
        console.log('\n', "ESKI MESAJLAR YUKLENDI", '\n');
        store.readFromFile(config.whatsapp.storeFile);
    }

    writeStoreToFile() {
        console.log('\n', "YENI MESAJ YAZILDI", '\n');
        store.writeToFile(config.whatsapp.storeFile);
    }

    async handleMessage(m) {
        for (const msg of m.messages) {
            if (!msg.key.fromMe && m.type === 'notify') {
                console.log('Processing incoming message:', msg);
            }
        }
        this.writeStoreToFile();
    }

    sendWhatsappStatus() {
        // Hangi soketi kullanýyorsanýz burada güncelleme yapýn
    }
}

module.exports = new WhatsappService();
