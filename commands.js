const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const { exec } = require("child_process");
const { SCREEN_NAME } = process.env;

async function whitelistAdd(player_name, message){
    const player_data = await prisma.whitelist.findFirst({
      where: {
        minecraft_name: player_name,
        AND: [
          {
            success: true
          }
        ]
      }
    })
    if (player_data) {
      message.channel.send(`ℹ️ ${player_name} a déjà été ajouté à la whitelist`)
      return
    }
    exec(`screen -S ${SCREEN_NAME} -p 0 -X stuff "whitelist add ${player_name}^M"`,async (err, stdout, stderr) => {
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
          if (err || stderr){
            message.channel.send(`❌ La whitelist n'a pas pu être rafraichir`)
          } else {
            exec(`screen -S alkana -p 0 -X stuff say ${player_name} a été ajouté à la whitelist par ${message.author.username}^M`)
            message.channel.send(`✅ ${player_name} peut se connecter sur Alkana !`)
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

async function whitelistRemove(player_name, message){
    const player_data = await prisma.whitelist.findFirst({
        where: {
          minecraft_name: player_name,
          AND: [
            {
              success: true
            }
          ]
        }
    })
    if (!player_data) {
        exec(`screen -S ${SCREEN_NAME} -p 0 -X stuff "whitelist remove ${player_name}^M"`,(err, stdout, stderr) => {
            exec(`screen -S ${SCREEN_NAME} -p 0 -X stuff "whitelist reload^M"`)
        })
        message.channel.send(`❌ ${player_name} n'est pas whitelisté`)
    } else if (player_data.discord_id !== message.author.id) {
        message.channel.send(`❌ ${player_name} n'a pas été whitelisté par vous`)
    } else {
        exec(`screen -S ${SCREEN_NAME} -p 0 -X stuff "whitelist remove ${player_name}^M"`,async (err, stdout, stderr) => {
            if (!err && !stderr) {
                exec(`screen -S ${SCREEN_NAME} -p 0 -X stuff "whitelist reload^M"`)
                message.channel.send(`✅ ${player_name} a pas été retiré de la whiteliste`)
                await prisma.whitelist.delete({where: {id: player_data.id}});
            }
        })
    }
}

module.exports = {whitelistAdd, whitelistRemove}