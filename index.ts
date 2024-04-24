import { Client, GatewayIntentBits } from "discord.js";
import { Bot } from "./structs/Bot";

export const bot = new Bot(
  new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages
    ]
  })
);

export const handler = async () => {
  try {
    // Lógica de tu función aquí
    // Por ejemplo, conectar el bot
    await bot.client.on('on', () => {
      console.log('bot on')
    });
    return {
      statusCode: 200,
      body: JSON.stringify('Función ejecutada correctamente'),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify('Ocurrió un error al ejecutar la función'),
    };
  }
};
