"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
const path_1 = require("path");
const checkPermissions_1 = require("../utils/checkPermissions");
const config_1 = require("../utils/config");
const i18n_1 = require("../utils/i18n");
const MissingPermissionsException_1 = require("../utils/MissingPermissionsException");
class Bot {
    client;
    prefix = "/";
    commands = new discord_js_1.Collection();
    slashCommands = new Array();
    slashCommandsMap = new discord_js_1.Collection();
    cooldowns = new discord_js_1.Collection();
    queues = new discord_js_1.Collection();
    constructor(client) {
        this.client = client;
        this.client.login(config_1.config.TOKEN);
        this.client.on("ready", () => {
            console.log(`${this.client.user.username} ready!`);
            this.registerSlashCommands();
        });
        this.client.on("warn", (info) => console.log(info));
        this.client.on("error", console.error);
        this.onInteractionCreate();
    }
    async registerSlashCommands() {
        const rest = new discord_js_1.REST({ version: "9" }).setToken(config_1.config.TOKEN);
        const commandFiles = (0, fs_1.readdirSync)((0, path_1.join)(__dirname, "..", "commands")).filter((file) => !file.endsWith(".map"));
        for (const file of commandFiles) {
            const command = await Promise.resolve(`${(0, path_1.join)(__dirname, "..", "commands", `${file}`)}`).then(s => __importStar(require(s)));
            this.slashCommands.push(command.default.data);
            this.slashCommandsMap.set(command.default.data.name, command.default);
        }
        await rest.put(discord_js_1.Routes.applicationCommands(this.client.user.id), { body: this.slashCommands });
    }
    async onInteractionCreate() {
        this.client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
            if (!interaction.isChatInputCommand())
                return;
            const command = this.slashCommandsMap.get(interaction.commandName);
            if (!command)
                return;
            if (!this.cooldowns.has(interaction.commandName)) {
                this.cooldowns.set(interaction.commandName, new discord_js_1.Collection());
            }
            const now = Date.now();
            const timestamps = this.cooldowns.get(interaction.commandName);
            const cooldownAmount = (command.cooldown || 1) * 1000;
            const timestamp = timestamps.get(interaction.user.id);
            if (timestamp) {
                const expirationTime = timestamp + cooldownAmount;
                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    return interaction.reply({
                        content: i18n_1.i18n.__mf("common.cooldownMessage", {
                            time: timeLeft.toFixed(1),
                            name: interaction.commandName
                        }),
                        ephemeral: true
                    });
                }
            }
            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
            try {
                const permissionsCheck = await (0, checkPermissions_1.checkPermissions)(command, interaction);
                if (permissionsCheck.result) {
                    command.execute(interaction);
                }
                else {
                    throw new MissingPermissionsException_1.MissingPermissionsException(permissionsCheck.missing);
                }
            }
            catch (error) {
                console.error(error);
                if (error.message.includes("permissions")) {
                    interaction.reply({ content: error.toString(), ephemeral: true }).catch(console.error);
                }
                else {
                    interaction.reply({ content: i18n_1.i18n.__("common.errorCommand"), ephemeral: true }).catch(console.error);
                }
            }
        });
    }
}
exports.Bot = Bot;
//# sourceMappingURL=Bot.js.map