/** **************************************
 *
 *   Claim: Plugin for PokeBot that powers the PokeWorld gym system.
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

exports.run = async (bot, msg) => {
  const isWhitelist = await bot.plugins.whitelist.isWhitelist(msg.guild.id);
  if (!isWhitelist) return msg.reply ('This is a Whiltelisted command. Get your server whitelisted by joining our server at https://discord.me/thedigitalregion and asking in the general channel. Sorry!');
  if (!msg.channel.name.startsWith('gym-')) return msg.reply('Go into one of the gym channels and try again.');
  if (msg.channel.topic == 'Current Owner: *none*') {
    let team;
    if (msg.member.roles.find('name', 'Skull')) team = 'Skull';
    if (msg.member.roles.find('name', 'Flare')) team = 'Flare';
    if (!team) return msg.reply('You have to join a team before you can claim a gym.');
    msg.reply('Alright, you have claimed this gym as yours! Be ready to battle anyone who approaches you');
    msg.channel.setTopic('Current Owner: ' + msg.author.id + '/' + msg.author.tag + '/' + team);
  }
  else {
    let team;
    if (msg.member.roles.find('name', 'Skull')) team = 'Skull';
    if (msg.member.roles.find('name', 'Flare')) team = 'Flare';
    if (!team) return msg.reply('You have to join a team before you can claim a gym.');
    const owner = msg.channel.topic.slice(15).substring(0, 18);
    if (msg.guild.members.find('id', owner).roles.find('name', team)) return msg.reply('Don\'t try battling your own team. They won\'t like you.');
    if (bot.gyms.get(msg.channel.id) != null) return msg.reply('Nope, someone is already battling the gym.');
    msg.channel.send('<@' + owner + '>, come here as ' + msg.member.displayName + ' wants to battle you.');
    const func = async mess => {
      if (mess.channel != msg.channel) return;
      let field = mess.embeds[0];
      if (!field) return;
      field = field.description;
      if (!field) return;
      field = field.split('\n')[0];
      if (!field) return;
      field = field.split(' ')[0];
      if (field != undefined) {
        const user = msg.guild.members.find(member => member.user.username === field);
        if (user != undefined) {
          if (user.id == owner) {
            await msg.channel.send('The owner has not been defeated!');
            bot.gyms.set(msg.channel.id, null);
            bot.removeListener('message', func);
          }
          if (user.id == msg.author.id) {
            await msg.channel.send('The owner has been defeated! Transferring gym!');
            let recipientTeam;
            if (msg.member.roles.find('name', 'Skull')) recipientTeam = 'Skull';
            if (msg.member.roles.find('name', 'Flare')) recipientTeam = 'Flare';
            await msg.channel.setTopic('Current Owner: ' + msg.member.id + '/' + msg.author.tag + '/' + recipientTeam);
            bot.gyms.set(msg.channel.id, null);
            bot.removeListener('message', func);
          }
        }
      }
    };
    bot.gyms.set(msg.channel.id, func);
    bot.on('message', func);
  }
};

exports.conf = {
  aliases: [],
  guildOnly: true,
};

exports.help = {
  name: 'claim',
  description: 'Claim a gym.',
};
