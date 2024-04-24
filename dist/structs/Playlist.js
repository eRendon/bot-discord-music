"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Playlist = void 0;
const tslib_1 = require("tslib");
const youtube_sr_1 = tslib_1.__importDefault(require("youtube-sr"));
const config_1 = require("../utils/config");
const Song_1 = require("./Song");
const pattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/i;
class Playlist {
    data;
    videos;
    constructor(playlist) {
        this.data = playlist;
        this.videos = this.data.videos
            .filter((video) => video.title != "Private video" && video.title != "Deleted video")
            .slice(0, config_1.config.MAX_PLAYLIST_SIZE - 1)
            .map((video) => {
            return new Song_1.Song({
                title: video.title,
                url: `https://youtube.com/watch?v=${video.id}`,
                duration: video.duration / 1000
            });
        });
    }
    static async from(url = "", search = "") {
        const urlValid = pattern.test(url);
        let playlist;
        if (urlValid) {
            playlist = await youtube_sr_1.default.getPlaylist(url);
        }
        else {
            const result = await youtube_sr_1.default.searchOne(search, "playlist");
            playlist = await youtube_sr_1.default.getPlaylist(result.url);
        }
        return new this(playlist);
    }
}
exports.Playlist = Playlist;
//# sourceMappingURL=Playlist.js.map