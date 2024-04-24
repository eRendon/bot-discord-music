"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../index");
const i18n_1 = require("../utils/i18n");
const queue_1 = require("../utils/queue");
const pattern = /^[0-9]{1,2}(\s*,\s*[0-9]{1,2})*$/;
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("remove")
        .setDescription(i18n_1.i18n.__("remove.description"))
        .addStringOption((option) => option.setName("slot").setDescription(i18n_1.i18n.__("remove.description")).setRequired(true)),
    execute(interaction) {
        const guildMemer = interaction.guild.members.cache.get(interaction.user.id);
        const removeArgs = interaction.options.getString("slot");
        const queue = index_1.bot.queues.get(interaction.guild.id);
        if (!queue)
            return interaction.reply({ content: i18n_1.i18n.__("remove.errorNotQueue"), ephemeral: true }).catch(console.error);
        if (!(0, queue_1.canModifyQueue)(guildMemer))
            return i18n_1.i18n.__("common.errorNotChannel");
        if (!removeArgs)
            return interaction.reply({ content: i18n_1.i18n.__mf("remove.usageReply", { prefix: index_1.bot.prefix }), ephemeral: true });
        const songs = removeArgs.split(",").map((arg) => parseInt(arg));
        let removed = [];
        if (pattern.test(removeArgs)) {
            queue.songs = queue.songs.filter((item, index) => {
                if (songs.find((songIndex) => songIndex - 1 === index))
                    removed.push(item);
                else
                    return true;
            });
            interaction.reply(i18n_1.i18n.__mf("remove.result", {
                title: removed.map((song) => song.title).join("\n"),
                author: interaction.user.id
            }));
        }
        else if (!isNaN(+removeArgs) && +removeArgs >= 1 && +removeArgs <= queue.songs.length) {
            return interaction.reply(i18n_1.i18n.__mf("remove.result", {
                title: queue.songs.splice(+removeArgs - 1, 1)[0].title,
                author: interaction.user.id
            }));
        }
        else {
            return interaction.reply({ content: i18n_1.i18n.__mf("remove.usageReply", { prefix: index_1.bot.prefix }) });
        }
    }
};
//# sourceMappingURL=remove.js.map