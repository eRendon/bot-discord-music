"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isURL = exports.mobileScRegex = exports.scRegex = exports.playlistPattern = exports.videoPattern = void 0;
exports.videoPattern = /^(https?:\/\/)?(www\.)?(m\.|music\.)?(youtube\.com|youtu\.?be)\/.+$/;
exports.playlistPattern = /^.*(list=)([^#\&\?]*).*/;
exports.scRegex = /^https?:\/\/(soundcloud\.com)\/(.*)$/;
exports.mobileScRegex = /^https?:\/\/(soundcloud\.app\.goo\.gl)\/(.*)$/;
exports.isURL = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
//# sourceMappingURL=patterns.js.map