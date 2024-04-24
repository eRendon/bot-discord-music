"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../index");
const i18n_1 = require("../utils/i18n");
const queue_1 = require("../utils/queue");
const safeReply_1 = require("../utils/safeReply");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder().setName("shuffle").setDescription(i18n_1.i18n.__("shuffle.description")),
    execute(interaction) {
        const queue = index_1.bot.queues.get(interaction.guild.id);
        const guildMemer = interaction.guild.members.cache.get(interaction.user.id);
        if (!queue)
            return interaction.reply({ content: i18n_1.i18n.__("shuffle.errorNotQueue"), ephemeral: true }).catch(console.error);
        if (!guildMemer || !(0, queue_1.canModifyQueue)(guildMemer))
            return i18n_1.i18n.__("common.errorNotChannel");
        let songs = queue.songs;
        for (let i = songs.length - 1; i > 1; i--) {
            let j = 1 + Math.floor(Math.random() * i);
            [songs[i], songs[j]] = [songs[j], songs[i]];
        }
        queue.songs = songs;
        const content = i18n_1.i18n.__mf("shuffle.result", { author: interaction.user.id });
        (0, safeReply_1.safeReply)(interaction, content);
    }
};
//# sourceMappingURL=shuffle.js.map