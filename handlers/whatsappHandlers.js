const whatsappService = require('../whatsapp/whatsappSocket');
const phoneNumberUtils = require('../utils/phoneNumberUtils');

const whatsappCommandHandlers = {
    waconnect: async () => {
        return whatsappService.start();
    },
    
    wadisconnect: async () => {
        let response = { error: null };
        try {
            if (whatsappService.connection.status === 'open') {
                whatsappService.connection.manuelDisconnect = true;
                whatsappService.socket.end();
            } else {
                response.message = "WhatsApp already disconnected.";
            }
        } catch (e) {
            response.error = { message: e.message };
        } finally {
            return response;
        }
    },

    tojid: async (command) => {
        let response = { error: null };
        try {
            const jid = command.phonenumber.toJid();
            response.jid = jid;
            response.number = jid.split("@")[0];
            if (!jid) throw new Error(command.phonenumber + " : Invalid number.");
        } catch (e) {
            response.error = { message: e.message };
        } finally {
            return response;
        }
    },

    getchathistory: async (command) => {
        const response = { error: null, chat: {} };
        try {
            const jid = command.phonenumber.toJid();
            if (!jid) throw new Error("Invalid number.");
            response.chat = await whatsappService.store.loadMessages(jid, command.count);
        } catch (e) {
            response.error = { message: e.message };
        } finally {
            return response;
        }
    },

    onwhatsapp: async (command) => {
        const response = { error: null, isexist: false };
        try {
            const jid = command.phonenumber.toJid();
            if (!jid) throw new Error("Invalid number.");
            const result = await whatsappService.socket.onWhatsApp(jid);
            response.result = result;
            if (result.length) response.isexist = true;
        } catch (e) {
            response.error = { message: e.message };
        } finally {
            return response;
        }
    },

    whatsappstatus: async () => {
        let response = { error: null };
        try {
            response.connection = whatsappService.connection;
        } catch (e) {
            response.error = { message: e.message };
        } finally {
            return response;
        }
    },

    profilpictureurl: async (command) => {
        const response = { error: null };
        const jid = command.phonenumber.toJid();
        try {
            if (!jid) throw new Error("Invalid number.");
            response.url = command.size ? await whatsappService.socket.profilePictureUrl(jid, command.size) : await whatsappService.socket.profilePictureUrl(jid);
        } catch (e) {
            response.error = { message: e.message };
        } finally {
            return response;
        }
    }
};

module.exports = whatsappCommandHandlers;
