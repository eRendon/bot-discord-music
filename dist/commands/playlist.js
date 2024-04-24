"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const index_1 = require("../index");
const MusicQueue_1 = require("../structs/MusicQueue");
const Playlist_1 = require("../structs/Playlist");
const i18n_1 = require("../utils/i18n");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("playlist")
        .setDescription(i18n_1.i18n.__("playlist.description"))
        .addStringOption((option) => option.setName("playlist").setDescription("Playlist name or link").setRequired(true)),
    cooldown: 5,
    permissions: [discord_js_1.PermissionsBitField.Flags.Connect, discord_js_1.PermissionsBitField.Flags.Speak],
    async execute(interaction, queryOptionName = "playlist") {
        let argSongName = interaction.options.getString(queryOptionName);
        const guildMemer = interaction.guild.members.cache.get(interaction.user.id);
        const { channel } = guildMemer.voice;
        const queue = index_1.bot.queues.get(interaction.guild.id);
        if (!channel)
            return interaction.reply({ content: i18n_1.i18n.__("playlist.errorNotChannel"), ephemeral: true }).catch(console.error);
        if (queue && channel.id !== queue.connection.joinConfig.channelId)
            if (interaction.replied)
                return interaction
                    .editReply({ content: i18n_1.i18n.__mf("play.errorNotInSameChannel", { user: interaction.client.user.username }) })
                    .catch(console.error);
            else
                return interaction
                    .reply({
                    content: i18n_1.i18n.__mf("play.errorNotInSameChannel", { user: interaction.client.user.username }),
                    ephemeral: true
                })
                    .catch(console.error);
        let playlist;
        try {
            playlist = await Playlist_1.Playlist.from(argSongName.split(" ")[0], argSongName);
        }
        catch (error) {
            console.error(error);
            if (interaction.replied)
                return interaction.editReply({ content: i18n_1.i18n.__("playlist.errorNotFoundPlaylist") }).catch(console.error);
            else
                return interaction
                    .reply({ content: i18n_1.i18n.__("playlist.errorNotFoundPlaylist"), ephemeral: true })
                    .catch(console.error);
        }
        if (queue) {
            queue.songs.push(...playlist.videos);
        }
        else {
            const newQueue = new MusicQueue_1.MusicQueue({
                interaction,
                textChannel: interaction.channel,
                connection: (0, voice_1.joinVoiceChannel)({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator
                })
            });
            index_1.bot.queues.set(interaction.guild.id, newQueue);
            newQueue.enqueue(...playlist.videos);
        }
        let playlistEmbed = new discord_js_1.EmbedBuilder()
            .setTitle(`${playlist.data.title}`)
            .setDescription(playlist.videos
            .map((song, index) => `${index + 1}. ${song.title}`)
            .join("\n")
            .slice(0, 4095))
            .setURL(playlist.data.url)
            .setColor("#F8AA2A")
            .setTimestamp();
        if (interaction.replied)
            return interaction.editReply({
                content: i18n_1.i18n.__mf("playlist.startedPlaylist", { author: interaction.user.id }),
                embeds: [playlistEmbed]
            });
        interaction
            .reply({
            content: i18n_1.i18n.__mf("playlist.startedPlaylist", { author: interaction.user.id }),
            embeds: [playlistEmbed]
        })
            .catch(console.error);
    }
};
//# sourceMappingURL=playlist.js.map