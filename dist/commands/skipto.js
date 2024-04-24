"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../index");
const i18n_1 = require("../utils/i18n");
const queue_1 = require("../utils/queue");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("skipto")
        .setDescription(i18n_1.i18n.__("skipto.description"))
        .addIntegerOption((option) => option.setName("number").setDescription(i18n_1.i18n.__("skipto.args.number")).setRequired(true)),
    execute(interaction) {
        const playlistSlotArg = interaction.options.getInteger("number");
        const guildMemer = interaction.guild.members.cache.get(interaction.user.id);
        if (!playlistSlotArg || isNaN(playlistSlotArg))
            return interaction
                .reply({
                content: i18n_1.i18n.__mf("skipto.usageReply", { prefix: index_1.bot.prefix, name: module.exports.name }),
                ephemeral: true
            })
                .catch(console.error);
        const queue = index_1.bot.queues.get(interaction.guild.id);
        if (!queue)
            return interaction.reply({ content: i18n_1.i18n.__("skipto.errorNotQueue"), ephemeral: true }).catch(console.error);
        if (!(0, queue_1.canModifyQueue)(guildMemer))
            return i18n_1.i18n.__("common.errorNotChannel");
        if (playlistSlotArg > queue.songs.length)
            return interaction
                .reply({ content: i18n_1.i18n.__mf("skipto.errorNotValid", { length: queue.songs.length }), ephemeral: true })
                .catch(console.error);
        if (queue.loop) {
            for (let i = 0; i < playlistSlotArg - 2; i++) {
                queue.songs.push(queue.songs.shift());
            }
        }
        else {
            queue.songs = queue.songs.slice(playlistSlotArg - 2);
        }
        queue.player.stop();
        interaction
            .reply({ content: i18n_1.i18n.__mf("skipto.result", { author: interaction.user.id, arg: playlistSlotArg - 1 }) })
            .catch(console.error);
    }
};
//# sourceMappingURL=skipto.js.map