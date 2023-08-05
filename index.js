const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const config = require('./config.json');
const { format } = require('date-fns');

let bot = null;
let botended = '';
console.clear()

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
    console.log('Minecraft bot is ready!');
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return; // Ignore messages sent by the bot itself

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();
    
    const content = `**___` + formattedDate + ` | ` + formattedTime + `___**` + ` ${username}: ${message}`;
    sendToDiscordWebhook(content);
    console.log(content);
  });

  bot.on('kicked', (reason, loggedIn) => {
    console.log(`Bot was kicked for reason: ${reason}`);
    botended = `Bot Kicked: ${reason} Reconnecting...`;
    setTimeout(createBot, 5000);
  });

  bot.once('end', () => {
    console.log('Minecraft bot disconnected. Attempting to reconnect...');
    botended = `Bot Disconnected (probably AFK) Reconnecting...`;
    setTimeout(createBot, 15000);
  });
}

function sendToDiscordWebhook(message) {
  const axios = require('axios');
  axios.post(config.discord.webhook_url, {
    content: message + '\n' + botended,
  })
  .then(() => {
    console.log(' ');
  })
  .catch((error) => {
    console.error('Failed to send message to Discord:', error);
  });
}

createBot();
