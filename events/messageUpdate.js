const { Events, EmbedBuilder: discordEmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageUpdate,
    async execute(message) {
        const guild_config = require(`../.private/${message.guild.id}_config.json`);
        if (!guild_config.botLogsChannelId) {
            return
        }

        if (!message.guildId) {
            return; //assume DM
        }
        if (message.author && message.author.bot) {
            return;
        }
        let msgContent = "*UNKNOWN*";
        if (message.content) {
            msgContent = message.content
        }
        const readableTime = new Date(message.createdTimestamp).toUTCString();
        const guild = await client.guilds.fetch(message.guildId);
        try {
            const messageEmbed = new discordEmbedBuilder()
                .setColor('Red')
                .setTitle(`Message Edited`)
                .setTimestamp()
                .setDescription(`**Original Message:** ${msgContent}\n**Edited Message:** ${message.reactions.message.content}`)
                .addFields(
                    {
                        name: 'Message Created:',
                        value: `${readableTime}`
                    },
                    {
                        name: 'Link',
                        value: `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`
                    }
                )
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
