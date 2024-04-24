"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.bot = void 0;
const discord_js_1 = require("discord.js");
const Bot_1 = require("./structs/Bot");
exports.bot = new Bot_1.Bot(new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildVoiceStates,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildMessageReactions,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.DirectMessages
    ]
}));
const handler = async () => {
    try {
        // Lógica de tu función aquí
        // Por ejemplo, conectar el bot
        await exports.bot.client.on('on', () => {
            console.log('bot on');
        });
        return {
            statusCode: 200,
            body: JSON.stringify('Función ejecutada correctamente'),
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify('Ocurrió un error al ejecutar la función'),
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=index.js.map