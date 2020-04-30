// require the discord.js module
const Discord = require( 'discord.js' );

module.exports = {
	name: 'crit', // command name
	description: 'How Critical Hits Work', // Description
	aliases: [ 'critical', 'crithit', 'criticalhit', 'critchance', 'criticalchance' ],
	execute( message, args ) {
		// Command to execute

		const prioritiesEmbed = new Discord.MessageEmbed()
			.setColor( '#9013FE' )
			.setTitle( 'How Critical Hits Work' )
			.setDescription(
				'Critical hit chance allows a hero to deal double damage with physical attacks (critical chance does not affect magical and pure damage types).\n' +
				'\n' +
				'There is a formula to calculate the exact percent chance of dealing a critical hit:\n' +
				'```Hero\'s critical hit chance/(Hero\'s critical hit chance + opponent\'s main stat)*100%```\n' +
				'\n' +
				'For instance, Ishmael with a critical hit chance of 7182 attacks Astaroth with Strength (his main stat) of 13030\n' +
				'\n' +
				'7182/(7182+13010)*100 = 35% chance that Ishmael\'s attack would deal double damage.\n' +
				'[Source](https://herowars.zendesk.com/hc/en-us/articles/360008903533-Energy-generation-system)' );

		message.channel.send( prioritiesEmbed );
	},
};
