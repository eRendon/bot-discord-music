"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const index_1 = require("../index");
const MusicQueue_1 = require("../structs/MusicQueue");
const Song_1 = require("../structs/Song");
const i18n_1 = require("../utils/i18n");
const patterns_1 = require("../utils/patterns");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("play")
        .setDescription(i18n_1.i18n.__("play.description"))
        .addStringOption((option) => option.setName("song").setDescription("The song you want to play").setRequired(true)),
    cooldown: 3,
    permissions: [discord_js_1.PermissionsBitField.Flags.Connect, discord_js_1.PermissionsBitField.Flags.Speak],
    async execute(interaction, input) {
        let argSongName = interaction.options.getString("song");
        if (!argSongName)
            argSongName = input;
        const guildMember = interaction.guild.members.cache.get(interaction.user.id);
        const { channel } = guildMember.voice;
        if (!channel)
            return interaction.reply({ content: i18n_1.i18n.__("play.errorNotChannel"), ephemeral: true }).catch(console.error);
        const queue = index_1.bot.queues.get(interaction.guild.id);
        if (queue && channel.id !== queue.connection.joinConfig.channelId)
            return interaction
                .reply({
                content: i18n_1.i18n.__mf("play.errorNotInSameChannel", { user: index_1.bot.client.user.username }),
                ephemeral: true
            })
                .catch(console.error);
        if (!argSongName)
            return interaction
                .reply({ content: i18n_1.i18n.__mf("play.usageReply", { prefix: index_1.bot.prefix }), ephemeral: true })
                .catch(console.error);
        const url = argSongName;
        if (interaction.replied)
            await interaction.editReply("⏳ Loading...").catch(console.error);
        else
            await interaction.reply("⏳ Loading...");
        // Start the playlist if playlist url was provided
        if (patterns_1.playlistPattern.test(url)) {
            await interaction.editReply("🔗 Link is playlist").catch(console.error);
            return index_1.bot.slashCommandsMap.get("playlist").execute(interaction, "song");
        }
        let song;
        try {
            song = await Song_1.Song.from(url, url);
        }
        catch (error) {
            console.error(error);
            if (error.name == "NoResults")
                return interaction
                    .reply({ content: i18n_1.i18n.__mf("play.errorNoResults", { url: `<${url}>` }), ephemeral: true })
                    .catch(console.error);
            if (error.name == "InvalidURL")
                return interaction
                    .reply({ content: i18n_1.i18n.__mf("play.errorInvalidURL", { url: `<${url}>` }), ephemeral: true })
                    .catch(console.error);
            if (interaction.replied)
                return await interaction.editReply({ content: i18n_1.i18n.__("common.errorCommand") }).catch(console.error);
            else
                return interaction.reply({ content: i18n_1.i18n.__("common.errorCommand"), ephemeral: true }).catch(console.error);
        }
        if (queue) {
            queue.enqueue(song);
            return interaction.channel
                .send({ content: i18n_1.i18n.__mf("play.queueAdded", { title: song.title, author: interaction.user.id }) })
                .catch(console.error);
        }
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
        newQueue.enqueue(song);
        interaction.deleteReply().catch(console.error);
    }
};
//# sourceMappingURL=play.js.map