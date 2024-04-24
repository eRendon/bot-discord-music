"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bot = void 0;
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
//# sourceMappingURL=index.js.map