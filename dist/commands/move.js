"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const array_move_1 = tslib_1.__importDefault(require("array-move"));
const discord_js_1 = require("discord.js");
const index_1 = require("../index");
const i18n_1 = require("../utils/i18n");
const queue_1 = require("../utils/queue");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("move")
        .setDescription(i18n_1.i18n.__("move.description"))
        .addIntegerOption((option) => option.setName("movefrom").setDescription(i18n_1.i18n.__("move.args.movefrom")).setRequired(true))
        .addIntegerOption((option) => option.setName("moveto").setDescription(i18n_1.i18n.__("move.args.moveto")).setRequired(true)),
    execute(interaction) {
        const movefromArg = interaction.options.getInteger("movefrom");
        const movetoArg = interaction.options.getInteger("moveto");
        const guildMemer = interaction.guild.members.cache.get(interaction.user.id);
        const queue = index_1.bot.queues.get(interaction.guild.id);
        if (!queue)
            return interaction.reply(i18n_1.i18n.__("move.errorNotQueue")).catch(console.error);
        if (!(0, queue_1.canModifyQueue)(guildMemer))
            return;
        if (!movefromArg || !movetoArg)
            return interaction.reply({ content: i18n_1.i18n.__mf("move.usagesReply", { prefix: index_1.bot.prefix }), ephemeral: true });
        if (isNaN(movefromArg) || movefromArg <= 1)
            return interaction.reply({ content: i18n_1.i18n.__mf("move.usagesReply", { prefix: index_1.bot.prefix }), ephemeral: true });
        let song = queue.songs[movefromArg - 1];
        queue.songs = (0, array_move_1.default)(queue.songs, movefromArg - 1, movetoArg == 1 ? 1 : movetoArg - 1);
        interaction.reply({
            content: i18n_1.i18n.__mf("move.result", {
                author: interaction.user.id,
                title: song.title,
                index: movetoArg == 1 ? 1 : movetoArg
            })
        });
    }
};
//# sourceMappingURL=move.js.map