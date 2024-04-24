"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canModifyQueue = void 0;
const canModifyQueue = (member) => member.voice.channelId === member.guild.members.me.voice.channelId;
exports.canModifyQueue = canModifyQueue;
//# sourceMappingURL=queue.js.map