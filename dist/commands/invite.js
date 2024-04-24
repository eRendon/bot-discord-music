"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const i18n_1 = require("../utils/i18n");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder().setName("invite").setDescription(i18n_1.i18n.__("invite.description")),
    execute(interaction) {
        const inviteEmbed = new discord_js_1.EmbedBuilder().setTitle(i18n_1.i18n.__mf("Invite me to your server!"));
        // return interaction with embed and button to invite the bot
        const actionRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setLabel(i18n_1.i18n.__mf("Invite"))
            .setStyle(discord_js_1.ButtonStyle.Link)
            .setURL(`https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`));
        return interaction.reply({ embeds: [inviteEmbed], components: [actionRow] }).catch(console.error);
    }
};
//# sourceMappingURL=invite.js.map