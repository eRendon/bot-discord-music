"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../index");
const i18n_1 = require("../utils/i18n");
const queue_1 = require("../utils/queue");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("volume")
        .setDescription(i18n_1.i18n.__("volume.description"))
        .addIntegerOption((option) => option.setName("volume").setDescription(i18n_1.i18n.__("volume.description"))),
    execute(interaction) {
        const queue = index_1.bot.queues.get(interaction.guild.id);
        const guildMemer = interaction.guild.members.cache.get(interaction.user.id);
        const volumeArg = interaction.options.getInteger("volume");
        if (!queue)
            return interaction.reply({ content: i18n_1.i18n.__("volume.errorNotQueue"), ephemeral: true }).catch(console.error);
        if (!(0, queue_1.canModifyQueue)(guildMemer))
            return interaction.reply({ content: i18n_1.i18n.__("volume.errorNotChannel"), ephemeral: true }).catch(console.error);
        if (!volumeArg || volumeArg === queue.volume)
            return interaction
                .reply({ content: i18n_1.i18n.__mf("volume.currentVolume", { volume: queue.volume }) })
                .catch(console.error);
        if (isNaN(volumeArg))
            return interaction.reply({ content: i18n_1.i18n.__("volume.errorNotNumber"), ephemeral: true }).catch(console.error);
        if (Number(volumeArg) > 100 || Number(volumeArg) < 0)
            return interaction.reply({ content: i18n_1.i18n.__("volume.errorNotValid"), ephemeral: true }).catch(console.error);
        queue.volume = volumeArg;
        queue.resource.volume?.setVolumeLogarithmic(volumeArg / 100);
        return interaction.reply({ content: i18n_1.i18n.__mf("volume.result", { arg: volumeArg }) }).catch(console.error);
    }
};
//# sourceMappingURL=volume.js.map