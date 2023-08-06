const mineflayer = require('mineflayer');
const { pathfinder } = require('mineflayer-pathfinder');
const config = require('./config.json');
const { format } = require('date-fns');
const axios = require('axios');

let bot = null;
let botended = '';

console.clear();

function createBot() {
  bot = mineflayer.createBot({
    host: config.minecraft.server_ip,
    username: config.minecraft.username,
    auth: "microsoft",
    version: "1.19.4",
    autoJump: false, // Disable autojump
  });

  bot.loadPlugin(pathfinder);

  bot.once('spawn', () => {
    console.log(`Bot Spawned at X: ${bot.entity.position.x}, Y: ${bot.entity.position.y}, Z: ${bot.entity.position.z}`);
    console.log('____________________________________CHAT________________________________________');
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return; // Ignore messages sent by the bot itself

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    const content = `**___${formattedDate} | ${formattedTime}___** ${username}: ${message}`;
    sendToDiscordWebhook(config.discord.main_webhook, content);
    console.log(content);
  });

  bot.on('kicked', (reason, loggedIn) => {
    console.log(`Bot was kicked for reason: ${reason}`);
    botended = `Bot Kicked: ${reason} Reconnecting...`;
    setTimeout(createBot, 15000);
  });

  bot.once('end', () => {
    console.log('Minecraft bot disconnected. Attempting to reconnect...');
    setTimeout(createBot, 15000);
  });
}

async function sendToDiscordWebhook(webhookUrl, message) {
  try {
    await axios.post(webhookUrl, {
      content: message,
    });
    console.log('Message sent to Discord successfully.');
  } catch (error) {
    console.error('Failed to send message to Discord:', error);
  }
}

createBot();
