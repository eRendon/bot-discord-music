"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../index");
const i18n_1 = require("../utils/i18n");
const queue_1 = require("../utils/queue");
const safeReply_1 = require("../utils/safeReply");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder().setName("stop").setDescription(i18n_1.i18n.__("stop.description")),
    execute(interaction) {
        const queue = index_1.bot.queues.get(interaction.guild.id);
        const guildMemer = interaction.guild.members.cache.get(interaction.user.id);
        if (!queue)
            return interaction.reply(i18n_1.i18n.__("stop.errorNotQueue")).catch(console.error);
        if (!guildMemer || !(0, queue_1.canModifyQueue)(guildMemer))
            return i18n_1.i18n.__("common.errorNotChannel");
        queue.stop();
        (0, safeReply_1.safeReply)(interaction, i18n_1.i18n.__mf("stop.result", { author: interaction.user.id }));
    }
};
//# sourceMappingURL=stop.js.map