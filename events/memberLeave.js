const { Events, EmbedBuilder: discordEmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const guild_config = require(`../.private/${member.guild.id}_config.json`);
        if (!guild_config.botLogsChannelId) {
            return
        }

        try {
            const leaveEmbed = new discordEmbedBuilder()
                .setColor('Red')
                .setTitle('Member Left')
                .setDescription(`${member} left the server.`)
                .setThumbnail(member.user.displayAvatarURL())
                .addFields(
                    { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
                )
                .setTimestamp();
            const logChannel = member.guild.channels.cache.get(guild_config.botLogsChannelId);
            if (logChannel) {
                logChannel.send({ embeds: [leaveEmbed] });
            }
        } catch (error) {
            console.error(`Error handling GuildMemberRemove event for ${member.user.tag}:`, error);
        }
    }
};