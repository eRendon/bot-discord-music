"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../index");
const i18n_1 = require("../utils/i18n");
const queue_1 = require("../utils/queue");
const safeReply_1 = require("../utils/safeReply");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder().setName("resume").setDescription(i18n_1.i18n.__("resume.description")),
    execute(interaction) {
        const queue = index_1.bot.queues.get(interaction.guild.id);
        const guildMemer = interaction.guild.members.cache.get(interaction.user.id);
        if (!queue)
            return interaction.reply({ content: i18n_1.i18n.__("resume.errorNotQueue"), ephemeral: true }).catch(console.error);
        if (!(0, queue_1.canModifyQueue)(guildMemer))
            return i18n_1.i18n.__("common.errorNotChannel");
        if (queue.player.unpause()) {
            const content = i18n_1.i18n.__mf("resume.resultNotPlaying", { author: interaction.user.id });
            (0, safeReply_1.safeReply)(interaction, content);
            return true;
        }
        const content = i18n_1.i18n.__("resume.errorPlaying");
        (0, safeReply_1.safeReply)(interaction, content);
        return false;
    }
};
//# sourceMappingURL=resume.js.map