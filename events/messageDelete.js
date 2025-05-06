const { Events, EmbedBuilder: discordEmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        const guild_config = require(`../.private/${message.guild.id}_config.json`);
        if (!guild_config.botLogsChannelId) {
            return
        }

        if (!message.guildId) {
            return; //assume DM
        }
        const readableTime = new Date(message.createdTimestamp).toUTCString();
        const guild = await client.guilds.fetch(message.guildId);
        try {
            const messageEmbed = new discordEmbedBuilder()
                .setColor('Red')
                .setTitle(`Message Deleted`)
                .setTimestamp()
                .setDescription(`**Message Created:** ${readableTime}\n**Deleted From:** ${message.channel}`)
            const logChannel = guild.channels.cache.get(guild_config.botLogsChannelId);
            if (logChannel) {
                logChannel.send({ embeds: [messageEmbed] });
            }
        }
        catch (error) {
            console.error(error);
        }
    }
}
