"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../index");
const i18n_1 = require("../utils/i18n");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder().setName("uptime").setDescription(i18n_1.i18n.__("uptime.description")),
    execute(interaction) {
        let seconds = Math.floor(index_1.bot.client.uptime / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);
        seconds %= 60;
        minutes %= 60;
        hours %= 24;
        return interaction
            .reply({ content: i18n_1.i18n.__mf("uptime.result", { days: days, hours: hours, minutes: minutes, seconds: seconds }) })
            .catch(console.error);
    }
};
//# sourceMappingURL=uptime.js.map