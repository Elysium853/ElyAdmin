// get-users-atlevel.js

const { EmbedBuilder: discordEmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { existsSync, readFileSync } = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('show-levels')
        .setDescription('Shows users at a specific level.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('The level to display users for.')
                .setRequired(true)),
    async execute(interaction) {
        const levelToShow = interaction.options.getInteger('level');
        const guildId = interaction.guildId;
        const usersLevelsFile = '.private/user-levels.json';

        try {
            if (!existsSync(usersLevelsFile)) {
                return interaction.reply({ content: 'The user level data file does not exist.' });
            }
            const data = readFileSync(usersLevelsFile, 'utf8');
            const usersLevels = JSON.parse(data);
            if (!usersLevels[guildId]) {
                return interaction.reply({ content: 'No level data found for this server.' });
            }
            const usersAtLevel = [];
            for (const userId in usersLevels[guildId]) {
                if (usersLevels[guildId][userId].level === levelToShow) {
                    usersAtLevel.push(userId);
                }
            }
            if (usersAtLevel.length === 0) {
                return interaction.reply({ content: `No users found at level ${levelToShow}.` });
            }
            const userMentions = usersAtLevel.map(userId => `<@${userId}>`).join('\n');

            const embed = new discordEmbedBuilder()
                .setTitle(`Users at Level ${levelToShow}`)
                .setDescription(userMentions)
                .setColor('#0099ff');

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in show-levels command:', error);
            await interaction.reply({ content: 'An error occurred while processing the command.' });
        }
    },
};