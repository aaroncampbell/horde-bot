// require the discord.js module
const Discord = require( 'discord.js' );

module.exports = {
	name: 'dodge', // command name
	description: 'How Dodge works', // Description
	execute( { message = {} } ) {
		// Command to execute

		const prioritiesEmbed = new Discord.MessageEmbed()
			.setColor( '#9013FE' )
			.setTitle( 'How Dodge Work' )
			.setDescription(
				'Dodge allows a hero to completely ignore physical damage (you can\'t dodge magic damage, however).\n' +
				'\n' +
				'There is a formula to calculate the exact percent chance of dodging a hit:\n' +
				'```Hero\'s dodge ratings/(Hero\'s dodge + opponent\'s main stat)*100%```\n' +
				'\n' +
				'For instance, Elmir with a dodge stat of 6350 who\'s being hit by Astaroth with Strength (his main stat) of 13030\n' +
				'\n' +
				'6350/(6350+13030)*100 = 32.7% chance that Elmir will dodge Asteroth\'s attack.\n' +
				'[Source](https://herowars.zendesk.com/hc/en-us/articles/360039321154-Critical-hit-chance-and-dodge)' );

		message.channel.send( prioritiesEmbed );
	},
};
