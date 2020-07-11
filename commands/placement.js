// require the discord.js module
const Discord = require( 'discord.js' );

module.exports = {
	name: 'placement', // command name
	description: 'Displays hero order by position.', // Description
	aliases: [ 'heroplacement' ],
	usage: `{prefix}{commandName}`,
	execute( { message = {}, args = [], rawArgs = '', commandName = '' } ) {
		// Embed to display
		let mainStatEmbed = new Discord.MessageEmbed()
			.setColor( '#9013FE' )
			.setTitle( '**HERO BATTLE PLACEMENT**' )
			.setDescription( "This is the order of heros. Chabba will sit in front of Aurora who sits in front of Cleaver etc... this is nice to keep in mind when planning out your teams. This is especially useful if you want to use Nebula or Dorian who are very placement specific with their buffs." )
			.addField( 'Front Line', "```\nChabba\nAurora\nCleaver\nLuther\nCorvus\nZiri\nRufus\nAstaroth\nGalahad\nIsh\nK'arkh\nMarkus\nElmir\nLilith\nAndvari\nQingMao\nSatori\n```", true )
			.addField( 'Mid Line', "```\nMaya\nArachne\nDante\nKrista\nKiera\nJudge\nMorrigan\nCeleste\nKai\nJhu\nSebastian*\nNebula\nMojo\nHedi\nJorgen\n```", true )
			.addField( 'Back Line', "```\nOrion\nGinger\nDareDevil\nDarkStar\nLars\nAstrid\nCornelius\nFaceless\nFox\nLian\nPhobos\nArtemis\nDorian\nPeppy\nJet\nThea\nHelios\nMartha\n```", true )
		;

		return message.channel.send( mainStatEmbed );
	},
};
