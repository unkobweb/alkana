const { Client, Intents } = require('discord.js');
const { exec } = require("child_process");
require('dotenv').config();
const { PrismaClient } = require('@prisma/client')
const { SCREEN_NAME, DISCORD_TOKEN } = process.env; 

const prisma = new PrismaClient();

const client = new Client({ 
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ] 
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.content.charAt(0) == "!") {
    const tmp = message.content.slice(1).split(" ");
    const command = tmp.shift();
    const args = [...tmp];

    switch (command) {
      case "whitelist":
        if (args.length == 1){
          const player_name = args[0]
          exec(`screen -S ${SCREEN_NAME} -p 0 -X stuff "whitelist add ${player_name}^M"`,async (err, stdout, stderr) => {
            console.log({err,stdout,stderr})
            if (err || stderr) {
              message.channel.send(`❌ ${player_name} n'a pas pu être ajouté à la whitelist`)
              await prisma.whitelist.create({
                data: {
                  minecraft_name: player_name,
                  discord_id: message.author.id,
                  discord_username: message.author.username,
                  success: false
                }
              })
            } else {
              exec(`screen -S ${SCREEN_NAME} -p 0 -X stuff "whitelist reload^M"`,(err, stdout, stderr) => {
                console.log({err,stdout,stderr})
                if (err || stderr){
                  message.channel.send(`❌ La whitelist n'a pas pu être rafraichir`)
                } else {
                  //exec(`screen -S alkana -p 0 -X stuff say ${player_name} a été ajouté à la whitelist par ${message.author.username}^M`)
                  message.channel.send(`✔️ ${player_name} peut se connecter sur Alkana !`)
                }
              })
              await prisma.whitelist.create({
                data: {
                  minecraft_name: player_name,
                  discord_id: message.author.id,
                  discord_username: message.author.username,
                  success: true
                }
              })
            }
          })
        } 
        break;
    }
  }
});

client.login(DISCORD_TOKEN);