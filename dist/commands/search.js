"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const youtube_sr_1 = tslib_1.__importDefault(require("youtube-sr"));
const __1 = require("..");
const i18n_1 = require("../utils/i18n");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("search")
        .setDescription(i18n_1.i18n.__("search.description"))
        .addStringOption((option) => option.setName("query").setDescription(i18n_1.i18n.__("search.optionQuery")).setRequired(true)),
    async execute(interaction) {
        const query = interaction.options.getString("query", true);
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member?.voice.channel)
            return interaction.reply({ content: i18n_1.i18n.__("search.errorNotChannel"), ephemeral: true }).catch(console.error);
        const search = query;
        await interaction.reply("⏳ Loading...").catch(console.error);
        let results = [];
        try {
            results = await youtube_sr_1.default.search(search, { limit: 10, type: "video" });
        }
        catch (error) {
            console.error(error);
            interaction.editReply({ content: i18n_1.i18n.__("common.errorCommand") }).catch(console.error);
            return;
        }
        if (!results || !results[0]) {
            interaction.editReply({ content: i18n_1.i18n.__("search.noResults") });
            return;
        }
        const options = results.map((video) => {
            return {
                label: video.title ?? "",
                value: video.url
            };
        });
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId("search-select")
            .setPlaceholder("Nothing selected")
            .setMinValues(1)
            .setMaxValues(10)
            .addOptions(options));
        const followUp = await interaction.followUp({
            content: "Choose songs to play",
            components: [row]
        });
        followUp
            .awaitMessageComponent({
            time: 30000
        })
            .then((selectInteraction) => {
            if (!(selectInteraction instanceof discord_js_1.StringSelectMenuInteraction))
                return;
            selectInteraction.update({ content: "⏳ Loading the selected songs...", components: [] });
            __1.bot.slashCommandsMap
                .get("play")
                .execute(interaction, selectInteraction.values[0])
                .then(() => {
                selectInteraction.values.slice(1).forEach((url) => {
                    __1.bot.slashCommandsMap.get("play").execute(interaction, url);
                });
            });
        })
            .catch(console.error);
    }
};
//# sourceMappingURL=search.js.map