"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeReply = void 0;
async function safeReply(interaction, content) {
    try {
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp(content);
        }
        else {
            await interaction.reply(content);
        }
    }
    catch (error) {
        console.error(error);
    }
}
exports.safeReply = safeReply;
//# sourceMappingURL=safeReply.js.map