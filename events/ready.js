const { EmbedBuilder: discordEmbedBuilder, Events } = require('discord.js');
const { CronJob } = require('cron');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const path = require('path');
const userActivityTracker = require('../modules/userActivityTracker');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		const now = new Date();
		console.log(`Current Time: ${now}`);
		console.log(`Logged into Discord as: ${client.user.tag}`);
		console.log(`Client ID: ${client.application?.id}`);
		const runAutoClean = require('../modules/autoclean');
		await client.guilds.cache.forEach(async (guild) => {
			console.log(`Logged into Guild: ${guild.name} (${guild.id})`);
			const configFileName = `${guild.id}_config.json`;
			const configFilePath = path.join(__dirname, '../.private', configFileName);
			if (!existsSync(configFilePath)) {
				try {
					writeFileSync(configFilePath, JSON.stringify(client.utils.guildConfig, null, 2));
					console.log(`Created config file: ${configFileName}`);
				} catch (error) {
					console.error(`Error creating config file ${configFileName}:`, error);
				}
			} else {
				try {
					const fileData = readFileSync(configFilePath, 'utf8');
					const existingConfig = JSON.parse(fileData);
					const mergedConfig = { ...client.utils.guildConfig, ...existingConfig };
					writeFileSync(configFilePath, JSON.stringify(mergedConfig, null, 2));
					console.log(`Updated config file: ${configFileName}`);
				} catch (error) {
					console.error(`Error reading or updating config file ${configFileName}:`, error);
				}
			}
		})

		// *** RUN ONCE ON STARTUP
		client.user.setActivity(`coded by Elysium!`);
		runAutoClean(client);
		checkUserActivity();

		// *** SCHEDULED JOBS
		const jobsEveryTenMinutes = new CronJob('0 */10 * * * *', async () => {
			runAutoClean(client);
		}, null, true, 'Etc/UTC');
		jobsEveryTenMinutes.start();

		const jobsEveryHour = new CronJob('0 0 * * * *', async () => {
			client.user.setActivity(`coded by Elysium!`);
		}, null, true, 'Etc/UTC');
		jobsEveryHour.start();

		const jobsEveryDay = new CronJob('0 0 0 * * *', async () => {
			checkUserActivity();
		}, null, true, 'Etc/UTC');
		jobsEveryDay.start();
	}
}

function checkUserActivity() {
	client.guilds.cache.forEach(guild => {
		const guildActivity = userActivityTracker.getGuildActivity(guild.id);
		guild.members.cache.forEach(member => {
			if (member.user.bot) return;
			const userData = guildActivity?.get(member.id);
			let daysSinceLastActivity;
			if (userData && userData.lastActive) {
				const lastActiveDate = new Date(userData.lastActive);
				const currentDate = new Date();
				const timeDifference = currentDate - lastActiveDate;
				daysSinceLastActivity = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
			} else {
				daysSinceLastActivity = 1000;
			}
			inactiveUserAction(guild, member, daysSinceLastActivity);
		});
	});
}

async function inactiveUserAction(guild, member, daysSinceLastActivity) {
	// Perform actions based on activity
	return;
}

async function getRoleFromGuild(guild, roleId) {
	try {
		const role = await guild.roles.fetch(roleId);
		return role;
	} catch (error) {
		console.error(`Error fetching role: ${error}`);
		return null;
	}
}

async function memberHasOnlyRole(member, role) {
	try {
		member = await member.fetch(true);
		const memberRoles = member.roles.cache.filter(r => r.id !== member.guild.roles.everyone.id && r.id !== member.id);
		if (memberRoles.size !== 1) {
			return false;
		}
		return memberRoles.has(role.id);
	} catch (error) {
		console.error(`Error checking member roles: ${error}`);
		return false;
	}
}