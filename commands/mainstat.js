// require the discord.js module
const Discord = require( 'discord.js' );

module.exports = {
	name: 'mainstat', // command name
	description: 'Displays stats gained by leveling main stat.', // Description
	usage: `{prefix}${this.name}`,
	execute( { message = {}, args = [], rawArgs = '', commandName = '' } ) {
		// Embed to display
		let mainStatEmbed = new Discord.MessageEmbed()
			.setColor( '#9013FE' )
			.setTitle( '**MAIN STAT CALCULATION**' )
			.setDescription( "If you've ever wondered what Intelligence, Strength, Agility stats give your heroes:\n\n** All **\n```\n+1 Physical Attack if it's the hero's main stat\n```\n**Strength: **\n```+40 Health```\n** Agility: **\n```\n+2 Physical Attack\n+1 Armor\n```\n**Intelligence: **\n```\n+3 Magic Attack\n+1 Magic Defense\n```" );

		return message.channel.send( mainStatEmbed );
	},
};
