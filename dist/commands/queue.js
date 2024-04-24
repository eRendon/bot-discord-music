"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../index");
const i18n_1 = require("../utils/i18n");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder().setName("queue").setDescription(i18n_1.i18n.__("queue.description")),
    cooldown: 5,
    async execute(interaction) {
        const queue = index_1.bot.queues.get(interaction.guild.id);
        if (!queue || !queue.songs.length)
            return interaction.reply({ content: i18n_1.i18n.__("queue.errorNotQueue") });
        let currentPage = 0;
        const embeds = generateQueueEmbed(interaction, queue.songs);
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId("previous").setLabel("⬅️").setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder().setCustomId("stop").setLabel("⏹").setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder().setCustomId("next").setLabel("➡️").setStyle(discord_js_1.ButtonStyle.Secondary));
        await interaction.reply("⏳ Loading queue...");
        if (interaction.replied)
            await interaction.editReply({
                content: `**${i18n_1.i18n.__mf("queue.currentPage")} ${currentPage + 1}/${embeds.length}**`,
                embeds: [embeds[currentPage]],
                components: [row]
            });
        const queueEmbed = await interaction.fetchReply();
        const filter = (buttonInteraction) => buttonInteraction.isButton() && buttonInteraction.user.id === interaction.user.id;
        const collector = queueEmbed.createMessageComponentCollector({ filter, time: 60000 });
        const buttonHandlers = {
            next: async () => {
                if (currentPage >= embeds.length - 1)
                    return;
                currentPage++;
                await interaction.editReply({
                    content: `**${i18n_1.i18n.__mf("queue.currentPage", {
                        page: currentPage + 1,
                        length: embeds.length
                    })}**`,
                    embeds: [embeds[currentPage]],
                    components: [row]
                });
            },
            previous: async () => {
                if (currentPage === 0)
                    return;
                currentPage--;
                await interaction.editReply({
                    content: `**${i18n_1.i18n.__mf("queue.currentPage", {
                        page: currentPage + 1,
                        length: embeds.length
                    })}**`,
                    embeds: [embeds[currentPage]],
                    components: [row]
                });
            },
            stop: async () => {
                await interaction.editReply({
                    components: []
                });
                collector.stop();
            }
        };
        collector.on("collect", async (buttonInteraction) => {
            buttonInteraction.deferUpdate();
            const handler = buttonHandlers[buttonInteraction.customId];
            if (handler) {
                await handler();
            }
        });
        collector.on("end", () => {
            queueEmbed
                .edit({
                components: []
            })
                .catch(console.error);
        });
    }
};
function generateQueueEmbed(interaction, songs) {
    let embeds = [];
    let k = 10;
    for (let i = 0; i < songs.length; i += 10) {
        const current = songs.slice(i, k);
        let j = i;
        k += 10;
        const info = current.map((track) => `${++j} - [${track.title}](${track.url})`).join("\n");
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(i18n_1.i18n.__("queue.embedTitle"))
            .setThumbnail(interaction.guild?.iconURL())
            .setColor("#F8AA2A")
            .setDescription(i18n_1.i18n.__mf("queue.embedCurrentSong", { title: songs[0].title, url: songs[0].url, info: info }))
            .setTimestamp();
        embeds.push(embed);
    }
    return embeds;
}
//# sourceMappingURL=queue.js.map