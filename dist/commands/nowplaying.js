"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const string_progressbar_1 = require("string-progressbar");
const index_1 = require("../index");
const i18n_1 = require("../utils/i18n");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder().setName("nowplaying").setDescription(i18n_1.i18n.__("nowplaying.description")),
    cooldown: 10,
    execute(interaction) {
        const queue = index_1.bot.queues.get(interaction.guild.id);
        if (!queue || !queue.songs.length)
            return interaction.reply({ content: i18n_1.i18n.__("nowplaying.errorNotQueue"), ephemeral: true }).catch(console.error);
        const song = queue.songs[0];
        const seek = queue.resource.playbackDuration / 1000;
        const left = song.duration - seek;
        let nowPlaying = new discord_js_1.EmbedBuilder()
            .setTitle(i18n_1.i18n.__("nowplaying.embedTitle"))
            .setDescription(`${song.title}\n${song.url}`)
            .setColor("#F8AA2A");
        if (song.duration > 0) {
            nowPlaying.addFields({
                name: "\u200b",
                value: new Date(seek * 1000).toISOString().substr(11, 8) +
                    "[" +
                    (0, string_progressbar_1.splitBar)(song.duration == 0 ? seek : song.duration, seek, 20)[0] +
                    "]" +
                    (song.duration == 0 ? " ◉ LIVE" : new Date(song.duration * 1000).toISOString().substr(11, 8)),
                inline: false
            });
            nowPlaying.setFooter({
                text: i18n_1.i18n.__mf("nowplaying.timeRemaining", {
                    time: new Date(left * 1000).toISOString().substr(11, 8)
                })
            });
        }
        return interaction.reply({ embeds: [nowPlaying] });
    }
};
//# sourceMappingURL=nowplaying.js.map