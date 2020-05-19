// require the discord.js module
const Discord = require( 'discord.js' );

module.exports = {
	name: 'costs', // command name
	description: 'Displays the cost of upgrading skins, GoE, and artifacts.', // Description
	aliases: [ 'herocosts' ],
	usage: `{prefix}${this.name}`,
	execute( { message = {}, args = [], rawArgs = '', commandName = '' } ) {
		// Embed to display
		let mainStatEmbed = new Discord.MessageEmbed()
			.setColor( '#9013FE' )
			.setTitle( '**UPGRADE COSTS**' )
			.addField( 'Skills', 'Upgrading all abilities from 0 to MAX costs 20,032,100 gold' )
			.addField( 'Skins', '```\nDefault = 30,825 skin stones\nChampion = 54,330 skin stones\nPurchased = 55,410 skin stones\n```' )
			.addField( 'Gifts of Elements', "```\nLEVEL     SPARKS       GOLD\n--------------------------- \n  1         250        7000\n  2         260        7500\n  3         270        8000\n  4         280        8000\n  5         290        8500\n  6         800       44000\n  7         840       47500\n  8         880       51500\n  9         920       55000\n  10        960       59000\n  11       1500      120500\n  12       1560      128500\n  13       1620      136500\n  14       1680      144500\n  15       1740      153000\n  16       2300      239000\n  17       2380      252500\n  18       2460      266500\n  19       2540      280500\n  20       2620      294500\n  21       3200      405500\n  22       3300      426000\n  23       3400      447000\n  24       3500      468500\n  25       3600      490000\n  26       4200      627000\n  27       4300      651000\n  28       4400      675500\n  29       4500      700000\n  30       4600      725000\n---------------------------\nTOTAL     65150     7927500\n```" )
			.addField( 'Artifacts Evolve', "```\nSTAR     FRAGMENTS     CHAOS CORE\n---------------------------------\nAwaken       1              0\n  1          3              1\n  2          6              3\n  3         15             12\n  4         50             30\n  5        150             75\n  6        N/A            N/A\n  ```" )
			.addField( 'Artifacts Level', "Total artifact essence required to level:\n```GREY = 624\nGREEN = 1050\nBLUE = 790\nVIOLET = 555\nORANGE = 555\n```" );

		return message.channel.send( mainStatEmbed );
	},
};
