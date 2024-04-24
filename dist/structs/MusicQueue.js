"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicQueue = void 0;
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const node_util_1 = require("node:util");
const index_1 = require("../index");
const config_1 = require("../utils/config");
const i18n_1 = require("../utils/i18n");
const queue_1 = require("../utils/queue");
const safeReply_1 = require("../utils/safeReply");
const wait = (0, node_util_1.promisify)(setTimeout);
class MusicQueue {
    interaction;
    connection;
    player;
    textChannel;
    bot = index_1.bot;
    resource;
    songs = [];
    volume = config_1.config.DEFAULT_VOLUME || 100;
    loop = false;
    muted = false;
    waitTimeout;
    queueLock = false;
    readyLock = false;
    stopped = false;
    /**
     * Constructs a new MusicQueue instance, setting up the audio player,
     * voice connection, and event listeners to manage voice state changes
     * and audio playback. It also handles network state changes to ensure
     * a stable connection for audio streaming.
     * @param options
     */
    constructor(options) {
        Object.assign(this, options);
        this.player = (0, voice_1.createAudioPlayer)({ behaviors: { noSubscriber: voice_1.NoSubscriberBehavior.Play } });
        this.connection.subscribe(this.player);
        const networkStateChangeHandler = (oldNetworkState, newNetworkState) => {
            const newUdp = Reflect.get(newNetworkState, "udp");
            clearInterval(newUdp?.keepAliveInterval);
        };
        this.connection.on("stateChange", async (oldState, newState) => {
            Reflect.get(oldState, "networking")?.off("stateChange", networkStateChangeHandler);
            Reflect.get(newState, "networking")?.on("stateChange", networkStateChangeHandler);
            if (newState.status === voice_1.VoiceConnectionStatus.Disconnected) {
                if (newState.reason === voice_1.VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
                    try {
                        this.stop();
                    }
                    catch (e) {
                        console.log(e);
                        this.stop();
                    }
                }
                else if (this.connection.rejoinAttempts < 5) {
                    await wait((this.connection.rejoinAttempts + 1) * 5000);
                    this.connection.rejoin();
                }
                else {
                    this.connection.destroy();
                }
            }
            else if (!this.readyLock &&
                (newState.status === voice_1.VoiceConnectionStatus.Connecting || newState.status === voice_1.VoiceConnectionStatus.Signalling)) {
                this.readyLock = true;
                try {
                    await (0, voice_1.entersState)(this.connection, voice_1.VoiceConnectionStatus.Ready, 20000);
                }
                catch {
                    if (this.connection.state.status !== voice_1.VoiceConnectionStatus.Destroyed) {
                        try {
                            this.connection.destroy();
                        }
                        catch { }
                    }
                }
                finally {
                    this.readyLock = false;
                }
            }
        });
        this.player.on("stateChange", async (oldState, newState) => {
            if (oldState.status !== voice_1.AudioPlayerStatus.Idle && newState.status === voice_1.AudioPlayerStatus.Idle) {
                if (this.loop && this.songs.length) {
                    this.songs.push(this.songs.shift());
                }
                else {
                    this.songs.shift();
                    if (!this.songs.length)
                        return this.stop();
                }
                if (this.songs.length || this.resource.audioPlayer)
                    this.processQueue();
            }
            else if (oldState.status === voice_1.AudioPlayerStatus.Buffering && newState.status === voice_1.AudioPlayerStatus.Playing) {
                this.sendPlayingMessage(newState);
            }
        });
        this.player.on("error", (error) => {
            console.error(error);
            if (this.loop && this.songs.length) {
                this.songs.push(this.songs.shift());
            }
            else {
                this.songs.shift();
            }
            this.processQueue();
        });
    }
    enqueue(...songs) {
        if (this.waitTimeout !== null)
            clearTimeout(this.waitTimeout);
        this.waitTimeout = null;
        this.stopped = false;
        this.songs = this.songs.concat(songs);
        this.processQueue();
    }
    stop() {
        if (this.stopped)
            return;
        this.stopped = true;
        this.loop = false;
        this.songs = [];
        this.player.stop();
        !config_1.config.PRUNING && this.textChannel.send(i18n_1.i18n.__("play.queueEnded")).catch(console.error);
        if (this.waitTimeout !== null)
            return;
        this.waitTimeout = setTimeout(() => {
            if (this.connection.state.status !== voice_1.VoiceConnectionStatus.Destroyed) {
                try {
                    this.connection.destroy();
                }
                catch { }
            }
            index_1.bot.queues.delete(this.interaction.guild.id);
            !config_1.config.PRUNING && this.textChannel.send(i18n_1.i18n.__("play.leaveChannel"));
        }, config_1.config.STAY_TIME * 1000);
    }
    /**
     * Processes the song queue for playback. This method checks if the queue is locked or if the player
     * is busy. If not, it proceeds to play the next song in the queue. This method is also responsible
     * for handling playback errors and retrying song playback when necessary. It ensures that the queue
     * continues to play smoothly, handling transitions between songs, including loop and stop behaviors.
     */
    async processQueue() {
        if (this.queueLock || this.player.state.status !== voice_1.AudioPlayerStatus.Idle) {
            return;
        }
        if (!this.songs.length) {
            return this.stop();
        }
        this.queueLock = true;
        const next = this.songs[0];
        try {
            const resource = await next.makeResource();
            this.resource = resource;
            this.player.play(this.resource);
            this.resource.volume?.setVolumeLogarithmic(this.volume / 100);
        }
        catch (error) {
            console.error(error);
            return this.processQueue();
        }
        finally {
            this.queueLock = false;
        }
    }
    async handleSkip(interaction) {
        await this.bot.slashCommandsMap.get("skip").execute(interaction);
    }
    async handlePlayPause(interaction) {
        if (this.player.state.status === voice_1.AudioPlayerStatus.Playing) {
            await this.bot.slashCommandsMap.get("pause").execute(interaction);
        }
        else {
            await this.bot.slashCommandsMap.get("resume").execute(interaction);
        }
    }
    async handleMute(interaction) {
        if (!(0, queue_1.canModifyQueue)(interaction.member))
            return;
        this.muted = !this.muted;
        if (this.muted) {
            this.resource.volume?.setVolumeLogarithmic(0);
            (0, safeReply_1.safeReply)(interaction, i18n_1.i18n.__mf("play.mutedSong", { author: interaction.user })).catch(console.error);
        }
        else {
            this.resource.volume?.setVolumeLogarithmic(this.volume / 100);
            (0, safeReply_1.safeReply)(interaction, i18n_1.i18n.__mf("play.unmutedSong", { author: interaction.user })).catch(console.error);
        }
    }
    async handleDecreaseVolume(interaction) {
        if (this.volume == 0)
            return;
        if (!(0, queue_1.canModifyQueue)(interaction.member))
            return;
        this.volume = Math.max(this.volume - 10, 0);
        this.resource.volume?.setVolumeLogarithmic(this.volume / 100);
        (0, safeReply_1.safeReply)(interaction, i18n_1.i18n.__mf("play.decreasedVolume", { author: interaction.user, volume: this.volume })).catch(console.error);
    }
    async handleIncreaseVolume(interaction) {
        if (this.volume == 100)
            return;
        if (!(0, queue_1.canModifyQueue)(interaction.member))
            return;
        this.volume = Math.min(this.volume + 10, 100);
        this.resource.volume?.setVolumeLogarithmic(this.volume / 100);
        (0, safeReply_1.safeReply)(interaction, i18n_1.i18n.__mf("play.increasedVolume", { author: interaction.user, volume: this.volume })).catch(console.error);
    }
    async handleLoop(interaction) {
        await this.bot.slashCommandsMap.get("loop").execute(interaction);
    }
    async handleShuffle(interaction) {
        await this.bot.slashCommandsMap.get("shuffle").execute(interaction);
    }
    async handleStop(interaction) {
        await this.bot.slashCommandsMap.get("stop").execute(interaction);
    }
    commandHandlers = new Map([
        ["skip", this.handleSkip],
        ["play_pause", this.handlePlayPause],
        ["mute", this.handleMute],
        ["decrease_volume", this.handleDecreaseVolume],
        ["increase_volume", this.handleIncreaseVolume],
        ["loop", this.handleLoop],
        ["shuffle", this.handleShuffle],
        ["stop", this.handleStop]
    ]);
    createButtonRow() {
        const firstRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId("skip").setLabel("⏭").setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder().setCustomId("play_pause").setLabel("⏯").setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder().setCustomId("mute").setLabel("🔇").setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder().setCustomId("decrease_volume").setLabel("🔉").setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder().setCustomId("increase_volume").setLabel("🔊").setStyle(discord_js_1.ButtonStyle.Secondary));
        const secondRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId("loop").setLabel("🔁").setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder().setCustomId("shuffle").setLabel("🔀").setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder().setCustomId("stop").setLabel("⏹").setStyle(discord_js_1.ButtonStyle.Secondary));
        return [firstRow, secondRow];
    }
    /**
     * Sets up a message component collector for the playing message to handle
     * button interactions. This collector listens for button clicks and dispatches
     * commands based on the custom ID of the clicked button. It supports functionalities
     * like skip, stop, play/pause, volume control, and more. The collector is also
     * responsible for stopping itself when the corresponding song is skipped or stopped,
     * ensuring that interactions are only valid for the current playing song.
     */
    async sendPlayingMessage(newState) {
        const song = newState.resource.metadata;
        let playingMessage;
        try {
            playingMessage = await this.textChannel.send({
                content: song.startMessage(),
                components: this.createButtonRow()
            });
        }
        catch (error) {
            console.error(error);
            if (error instanceof Error)
                this.textChannel.send(error.message);
            return;
        }
        const filter = (i) => i.isButton() && i.message.id === playingMessage.id;
        const collector = playingMessage.createMessageComponentCollector({
            filter,
            time: song.duration > 0 ? song.duration * 1000 : 60000
        });
        collector.on("collect", async (interaction) => {
            if (!interaction.isButton())
                return;
            if (!this.songs)
                return;
            const handler = this.commandHandlers.get(interaction.customId);
            if (["skip", "stop"].includes(interaction.customId))
                collector.stop();
            if (handler)
                await handler.call(this, interaction);
        });
        collector.on("end", () => {
            // Remove the buttons when the song ends
            playingMessage.edit({ components: [] }).catch(console.error);
            // Delete the message if pruning is enabled
            if (config_1.config.PRUNING) {
                setTimeout(() => {
                    playingMessage.delete().catch();
                }, 3000);
            }
        });
    }
}
exports.MusicQueue = MusicQueue;
//# sourceMappingURL=MusicQueue.js.map