const { EmbedBuilder: discordEmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { readFileSync, writeFileSync } = require('fs');

module.exports = {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option =>
            option.setName('member-to-warn')
                .setDescription('Select member')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the warning.')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('length')
                .setDescription('Optional mute duration in minutes (default: no mute)')
                .setMinValue(1)
                .setMaxValue(8640)
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const member = interaction.guild.members.cache.get(interaction.options.getUser('member-to-warn').id);
        const reason = interaction.options.getString('reason');
        const length = interaction.options.getInteger('length') || 0;

        const embed = new discordEmbedBuilder()
            .setColor('Orange')
            .setTitle(`User Warned`)
            .setDescription(`**User:** ${member.user.username} (ID: ${member.id})`)
            .addFields(
                { name: 'Reason:', value: reason },
                { name: 'Warned By:', value: interaction.user.tag },
                { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();

        if (length > 0) {
            try {
                const msDuration = length * 60000;
                await member.timeout(msDuration, reason);
                embed.addFields({ name: 'Muted For:', value: `${length} minutes` });
            } catch (error) {
                console.error('Error muting member:', error);
            }
        }

        try {
            const infractionsFile = './.private/infractions.json';
            let infractionsData;
            try {
                infractionsData = await JSON.parse(readFileSync(infractionsFile));
            } catch (error) {
                infractionsData = {};
            }

            const userId = member.id;
            if (!infractionsData[userId]) {
                infractionsData[userId] = [];
            }

            infractionsData[userId].push({
                moderator: interaction.user.tag,
                reason,
                timestamp: Date.now(),
            });

            writeFileSync(infractionsFile, JSON.stringify(infractionsData, null, 2));

            const totalInfractions = infractionsData[userId].length;
            embed.addFields({ name: 'Total Infractions:', value: totalInfractions.toString() });

            await interaction.editReply({ embeds: [embed] });
            try {
                await member.send({ embeds: [embed] });
            } catch (error) {
                console.error(`DMs CLOSED: ${member.user.username} (ID: ${member.id})`);
            }

            const logChannel = interaction.channel;
            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            } else {
                console.error('Log channel not found.');
            }
        } catch (error) {
            console.error(error);
            return await interaction.editReply({ content: `Something went wrong! Check logs.`, flags: MessageFlags.Ephemeral });
        }
    }
}