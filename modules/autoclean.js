// autoclean.js
const { existsSync, readFileSync, writeFileSync, mkdirSync } = require('fs');
const path = require('path');
const purgeMessages = require('./purgeMessages');

module.exports = async function runAutoClean(client) {
    const privateDirPath = path.join(__dirname, '..', '.private');
    const autocleansfile = path.join(privateDirPath, 'autocleanChannels.json');

    // Create the .private directory if it doesn't exist
    if (!existsSync(privateDirPath)) {
        mkdirSync(privateDirPath, { recursive: true });
    }

    // Create the autocleanChannels.json file if it doesn't exist
    if (!existsSync(autocleansfile)) {
        writeFileSync(autocleansfile, JSON.stringify({}, null, 2), 'utf8');
        console.log(`Created ${autocleansfile}`);
    }

    try {
        if (existsSync(autocleansfile)) {
            const data = readFileSync(autocleansfile, 'utf8');
            const autocleanChannels = JSON.parse(data);

            for (const channelId in autocleanChannels) {
                if (autocleanChannels.hasOwnProperty(channelId)) {
                    const channel = await client.channels.fetch(channelId).catch(console.error);
                    if (channel) {
                        await purgeMessages(channel, 99);
                    } else {
                        console.error(`Channel with ID ${channelId} not found.`);
                    }
                }
            }
        } else {
            console.error(`${autocleansfile} not found.`);
        }
    } catch (error) {
        console.error('Error in autoclean process:', error);
    }
};