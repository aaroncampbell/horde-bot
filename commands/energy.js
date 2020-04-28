// require the discord.js module
const Discord = require( 'discord.js' );

module.exports = {
	name: 'energy', // command name
	description: 'How energy builds', // Description
	execute( message, args ) {
		// Command to execute

		const prioritiesEmbed = new Discord.MessageEmbed()
			.setColor( '#9013FE' )
			.setTitle( 'How Energy Works' )
			.setDescription(
				'**Heroes**\n```'+
				'Basic Attack:  +10% energy\n' +
				'Using Skills:  +10% energy\n' +
				'Losing Health: +1%  energy for every 1% health lost\n' +
				'Killing Blow:  +30% energy for every enemy killed```\n' +
				'\n' +
				'**Titans**\n```' +
				'Basic Attack:  +20%  energy\n' +
				'Using Ability: +20%  energy\n' +
				'Losing Health: +0.5% energy for every 1% health lost\n' +
				'Killing Blow:  +30%  energy for every enemy killed```\n' +
				'[Source](https://herowars.zendesk.com/hc/en-us/articles/360008903533-Energy-generation-system)' );

		message.channel.send( prioritiesEmbed );
	},
};
