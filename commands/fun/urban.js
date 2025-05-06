const { EmbedBuilder: discordEmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName('urban')
        .setDescription(`Get the urban dictionary definition for a word`)
        .addStringOption(option =>
            option
                .setName('word')
                .setDescription('The word to define.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const word = interaction.options.getString('word');
        const wordHttp = makeHttpCompatible(word);
        const defResponse = await fetch(`https://api.urbandictionary.com/v0/define?term=${wordHttp}`);
        if (!defResponse.ok) {
            return await interaction.reply({ content: `* **Definition for \`${word}\` Not Found!**` });
        }
        const { list } = await defResponse.json();
        if (!list.length) {
            return await interaction.reply({ content: `* **Definition for \`${word}\` Not Found!**` });
        }
        const [definition] = list; // Get the first definition
        const embed = new discordEmbedBuilder()
            .setTitle(definition.word)
            .setURL(definition.permalink)
            .setDescription(definition.definition.slice(0, 4095)) // Limit to Embed's max length
            .setFooter({ text: `👍 ${definition.thumbs_up} 👎 ${definition.thumbs_down}` });
        return await interaction.reply({ embeds: [embed] });
    }
}

function makeHttpCompatible(str) {
    return encodeURIComponent(str);
}
