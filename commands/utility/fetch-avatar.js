const { EmbedBuilder: discordEmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName('fetch-avatar')
        .setDescription('Fetch a member\'s avatar and banner by id.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Discord ID of the member to fetch their Avatar and Banner.')
                .setRequired(false)
        )
        .addUserOption(option =>
            option
                .setName('member')
                .setDescription('The Guild member to fetch their Avatar and Banner.')
                .setRequired(false)
        ),

    async execute(interaction) {
        let userId;
        const member = interaction.options.getMember('member');
        if (member) {
            userId = member.user.id;
        } else {
            userId = await interaction.options.getString('id');
        }
        try {
            const user = await client.users.fetch(userId, { force: true });
            let userName;
            if (user.globalName) {
                userName = user.globalName;
            } else {
                userName = user.username;
            }
            const avatarURL = user.displayAvatarURL({ size: 4096 });
            const bannerURL = user.bannerURL({ size: 4096 });
            const embed = new discordEmbedBuilder()
                .setColor('Red')
                .setTitle(`${userName} (ID: ${userId})`)
                .setAuthor({ name: userName, iconURL: avatarURL })
                .setThumbnail(avatarURL)
                .setImage(bannerURL)
                .setDescription(`**Avatar URL:** ${avatarURL}\n**Banner URL:** ${bannerURL}`);

            return await interaction.reply({ embeds: [embed] });
        } catch (error) {
            return await interaction.reply({ content: `Invalid user ID: ${userId}` });
        }
    }
}