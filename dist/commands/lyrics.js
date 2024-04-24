"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const i18n_1 = require("../utils/i18n");
// @ts-ignore
const lyrics_finder_1 = tslib_1.__importDefault(require("lyrics-finder"));
const index_1 = require("../index");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder().setName("lyrics").setDescription(i18n_1.i18n.__("lyrics.description")),
    async execute(interaction) {
        const queue = index_1.bot.queues.get(interaction.guild.id);
        if (!queue || !queue.songs.length)
            return interaction.reply(i18n_1.i18n.__("lyrics.errorNotQueue")).catch(console.error);
        await interaction.reply("⏳ Loading...").catch(console.error);
        let lyrics = null;
        const title = queue.songs[0].title;
        try {
            lyrics = await (0, lyrics_finder_1.default)(queue.songs[0].title, "");
            if (!lyrics)
                lyrics = i18n_1.i18n.__mf("lyrics.lyricsNotFound", { title: title });
        }
        catch (error) {
            lyrics = i18n_1.i18n.__mf("lyrics.lyricsNotFound", { title: title });
        }
        let lyricsEmbed = new discord_js_1.EmbedBuilder()
            .setTitle(i18n_1.i18n.__mf("lyrics.embedTitle", { title: title }))
            .setDescription(lyrics.length >= 4096 ? `${lyrics.substr(0, 4093)}...` : lyrics)
            .setColor("#F8AA2A")
            .setTimestamp();
        return interaction.editReply({ content: "", embeds: [lyricsEmbed] }).catch(console.error);
    }
};
//# sourceMappingURL=lyrics.js.map