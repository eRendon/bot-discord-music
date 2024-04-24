"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const i18n_1 = require("../utils/i18n");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder().setName("ping").setDescription(i18n_1.i18n.__("ping.description")),
    cooldown: 10,
    execute(interaction) {
        interaction
            .reply({ content: i18n_1.i18n.__mf("ping.result", { ping: Math.round(interaction.client.ws.ping) }), ephemeral: true })
            .catch(console.error);
    }
};
//# sourceMappingURL=ping.js.map