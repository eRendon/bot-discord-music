"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Song = void 0;
const tslib_1 = require("tslib");
const voice_1 = require("@discordjs/voice");
const youtube_sr_1 = tslib_1.__importDefault(require("youtube-sr"));
const i18n_1 = require("../utils/i18n");
const patterns_1 = require("../utils/patterns");
const { stream, video_basic_info } = require("play-dl");
class Song {
    url;
    title;
    duration;
    constructor({ url, title, duration }) {
        this.url = url;
        this.title = title;
        this.duration = duration;
    }
    static async from(url = "", search = "") {
        const isYoutubeUrl = patterns_1.videoPattern.test(url);
        let songInfo;
        if (isYoutubeUrl) {
            songInfo = await video_basic_info(url);
            return new this({
                url: songInfo.video_details.url,
                title: songInfo.video_details.title,
                duration: parseInt(songInfo.video_details.durationInSec)
            });
        }
        else {
            const result = await youtube_sr_1.default.searchOne(search);
            result ? null : console.log(`No results found for ${search}`);
            if (!result) {
                let err = new Error(`No search results found for ${search}`);
                err.name = "NoResults";
                if (patterns_1.isURL.test(url))
                    err.name = "InvalidURL";
                throw err;
            }
            songInfo = await video_basic_info(`https://youtube.com/watch?v=${result.id}`);
            return new this({
                url: songInfo.video_details.url,
                title: songInfo.video_details.title,
                duration: parseInt(songInfo.video_details.durationInSec)
            });
        }
    }
    async makeResource() {
        let playStream;
        const source = this.url.includes("youtube") ? "youtube" : "soundcloud";
        if (source === "youtube") {
            playStream = await stream(this.url);
        }
        if (!stream)
            return;
        return (0, voice_1.createAudioResource)(playStream.stream, { metadata: this, inputType: playStream.type, inlineVolume: true });
    }
    startMessage() {
        return i18n_1.i18n.__mf("play.startedPlaying", { title: this.title, url: this.url });
    }
}
exports.Song = Song;
//# sourceMappingURL=Song.js.map