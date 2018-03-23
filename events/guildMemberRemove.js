/** **************************************
 *
 *   GuildMemberRemove: Plugin for PokeBot that waves bye to a user who leaves.
 *   Copyright (C) 2018 TheEdge, jtsshieh, Alee
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * *************************************/

module.exports = async (bot, member) => {
  const { RichEmbed } = require('discord.js');
  const logChannel = await bot.plugins.settings.getStr('logs', member.guild.id);
  bot.channels.find('id', logChannel).send(
    new RichEmbed()
      .setColor(0x00ae86)
      .setTitle(`:arrow_left: ${member.user.tag}`)
      .setDescription(`*${member.user.tag}* left this server.`)
      .addField('ID', member.id, true)
      .addField('Created Account', member.user.createdAt, true)
      .addField('Joined At', member.joinedAt, true)
      .setTimestamp()
      .setFooter(member.user.tag, member.user.avatarURL)
  );
  if (member.guild.id != '417088992329334792') return;
  try {
    draw(bot, member);
  }
  catch (err)
  {
    bot.Raven.captureException(err);
  }
  bot.channels.get('426548985172459533').setName('User Count: ' + member.guild.memberCount);
  bot.channels.get('417100669980508160').send(`**${member.user.tag}** just left. We now have ${member.guild.memberCount} members left. Aww man...`);
};

async function draw(bot, member) {
  const Canvas = require('canvas');
  const request = require('request-promise');
  Canvas.registerFont('./assets/Ketchum.otf', {
    family: 'Ketchum'
  });
  const canvas = Canvas.createCanvas(1500, 500);
  const ctx = canvas.getContext('2d');
  const Image = Canvas.Image;
  const base = new Image();
  const avatar = new Image();
  const fs = require('fs');

  avatar.src = await request({
    uri: member.user.avatarURL,
    encoding: null
  });
  base.src = await fs.readFileSync('./assets/Pokemon_Leave_Template.png');
  ctx.drawImage(base, 0, 0, 1500, 500);

  ctx.font = '100px Ketchum';
  ctx.fillStyle = '#e5da2a';
  ctx.strokeStyle = '#3b4cca';
  ctx.lineWidth = 5;
  ctx.fillText(member.user.tag, 475, 175);
  ctx.strokeText(member.user.tag, 475, 175);

  ctx.font = '55px Ketchum';
  ctx.fillStyle = '#fff';
  ctx.fillText(member.guild.name, 915, 435);

  ctx.font = '40px Ketchum';
  ctx.fillStyle = '#fff';
  ctx.fillText(member.guild.memberCount + ' members', 100, 70);

  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(208, 267, 166, 0, 2 * Math.PI, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 43, 101, 329, 331);
  return bot.channels.get('417100669980508160').send({
    files: [{
      attachment: canvas.toBuffer(),
      name: 'leaveCard.png'
    }
    ]
  });
}
