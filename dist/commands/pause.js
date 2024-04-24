"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../index");
const i18n_1 = require("../utils/i18n");
const queue_1 = require("../utils/queue");
const safeReply_1 = require("../utils/safeReply");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder().setName("pause").setDescription(i18n_1.i18n.__("pause.description")),
    execute(interaction) {
        const guildMemer = interaction.guild.members.cache.get(interaction.user.id);
        const queue = index_1.bot.queues.get(interaction.guild.id);
        if (!queue)
            return interaction.reply({ content: i18n_1.i18n.__("pause.errorNotQueue") }).catch(console.error);
        if (!(0, queue_1.canModifyQueue)(guildMemer))
            return i18n_1.i18n.__("common.errorNotChannel");
        if (queue.player.pause()) {
            const content = i18n_1.i18n.__mf("pause.result", { author: interaction.user.id });
            (0, safeReply_1.safeReply)(interaction, content);
            return true;
        }
    }
};
//# sourceMappingURL=pause.js.map