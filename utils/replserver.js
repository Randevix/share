const repl = require('repl');
const config = require('../config');

const start = function () {
    if (config.debug) {
        const replServer = repl.start({ prompt:'> ', useGlobal: true });
        replServer.context.soket = global.w.soket;
        replServer.context.whats = global.w.whatsappService;
        replServer.context.conn = global.w.connection;
        replServer.context.config = config;
    }

}

module.exports = { start }
