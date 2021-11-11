const { Client, Intents } = require('discord.js');
const { PrismaClient } = require('@prisma/client')
require('dotenv').config();
const { DISCORD_TOKEN } = process.env;
const { whitelistAdd, whitelistRemove } = require('./commands');

const prisma = new PrismaClient();

const client = new Client({ 
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ] 
});

client.on('ready', async () => {
  await prisma.$connect();
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.content.length > 10 && message.content.slice(0,10) == "!whitelist") {
    const tmp = message.content.slice(10).trim().split(" ");
    const command = tmp.shift();
    const args = [...tmp];

    if (args.length !== 1) return;

    switch (command) {
      case "add":
        whitelistAdd(args[0],message)
        break;
      case "remove":
        whitelistRemove(args[0],message)
        break;
    }
  }
});

client.login(DISCORD_TOKEN);