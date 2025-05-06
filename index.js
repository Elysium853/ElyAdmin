const { join } = require('node:path');
const { readdirSync } = require('node:fs');
const foldersPath = join(__dirname, 'commands');
const eventsPath = join(__dirname, 'events');
const commandFolders = readdirSync(foldersPath);
const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));
const configFile = require('./.private/config.json');
const userActivityTracker = require('./modules/userActivityTracker');

const { Client, Collection, IntentsBitField, Partials } = require('discord.js');
const _partials = [
	Partials["User"],
	Partials["Channel"],
	Partials["GuildMember"],
	Partials["Message"],
	Partials["Reaction"],
];
const _intents = new IntentsBitField([
	"Guilds",
	"GuildModeration",
	"GuildEmojisAndStickers",
	"GuildIntegrations",
	"GuildBans",
	"GuildInvites",
	"GuildMembers",
	"GuildMessageReactions",
	"GuildMessageTyping",
	"GuildMessages",
	"GuildPresences",
	"GuildScheduledEvents",
	"GuildVoiceStates",
	"GuildWebhooks",
	"DirectMessages",
	"DirectMessageTyping",
	"DirectMessageReactions",
	"MessageContent",
	"AutoModerationConfiguration",
	"AutoModerationExecution"
]);

global.client = new Client({ partials: _partials, intents: _intents });
client.cooldowns = new Collection();
client.commands = new Collection();

client.utils = {
	configFile,
	guildConfig: {
		botLogsChannelId: "",
		ticketChannelId: "",
		userLevelsChannelId: ""
	},
	getCurrentDateYYYYMMDD_hhmmss: () => {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const seconds = String(now.getSeconds()).padStart(2, '0');
		return `${year}-${month}-${day}_${hours}${minutes}${seconds}`;
	}
}

for (const folder of commandFolders) {
	const commandsPath = join(foldersPath, folder);
	const commandFiles = readdirSync(commandsPath).filter(file => {
		return file.endsWith('.js') && !file.endsWith('_main.js');
	});
	for (const file of commandFiles) {
		const filePath = join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

for (const file of eventFiles) {
	const filePath = join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(configFile.botToken);
