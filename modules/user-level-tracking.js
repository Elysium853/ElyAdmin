// user-level-tracking.js

const { readFileSync, writeFileSync } = require('fs');
const { EmbedBuilder: discordEmbedBuilder } = require('discord.js');

module.exports = (client) => {
    return {
        parse_message: async function (message) {
            if (message.content.length < 30) {
                return;
            }
            const guildId = message.guildId;
            const userId = message.author.id;
            let guild_config;
            try {
                guild_config = require(`../.private/${guildId}_config.json`);
                if (!guild_config.userLevelsChannelId) {
                    return;
                }
                const usersLevelsFile = '.private/user-levels.json';
                let usersLevels = {};
                try {
                    const data = readFileSync(usersLevelsFile, 'utf8');
                    usersLevels = JSON.parse(data);
                } catch (err) {
                    if (err.code === 'ENOENT') {
                        writeFileSync(usersLevelsFile, '{}');
                        usersLevels = {};
                    } else {
                        console.error('Error loading user levels:', err);
                        return;
                    }
                }
                if (!usersLevels[guildId]) {
                    usersLevels[guildId] = {};
                }
                if (!usersLevels[guildId][userId]) {
                    usersLevels[guildId][userId] = { messageCount: 1, level: 0 };
                } else {
                    usersLevels[guildId][userId].messageCount++;
                    const newLevel = calculateUsersLevels(usersLevels[guildId][userId].messageCount);
                    if (newLevel > usersLevels[guildId][userId].level) {
                        usersLevels[guildId][userId].level = newLevel;

                        const embed = new discordEmbedBuilder()
                            .setColor('#00FF00')
                            .setTitle(`Level Up, ${message.author.username}!`)
                            .setDescription(`You've reached level ${newLevel}!\nNice work!`);

                        const logChannel = message.guild.channels.cache.get(guild_config.userLevelsChannelId);
                        if (logChannel) {
                            logChannel.send({ content: `<@${userId}>`, embeds: [embed] });
                        }
                    }
                }
                saveUsersLevels(usersLevelsFile, usersLevels);
            } catch (error) {
                console.error("error in parse_message: ", error);
            }
        },
    };
};

function saveUsersLevels(usersLevelsFile, levels) {
    writeFileSync(usersLevelsFile, JSON.stringify(levels));
}

function calculateUsersLevels(messageCount) {
    let level = Math.sqrt(messageCount / 3);
    return Math.floor(level);
}