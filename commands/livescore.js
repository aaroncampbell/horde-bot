// require the discord.js module
const Discord = require( 'discord.js' );
const config = require( '../loadConfig.js' );

module.exports = {
	name: 'livescore', // command name
	description: 'Used to display scores of matches.', // Description
	args: true, // If args are required for this command
	usage: `\`{prefix}{commandName} [name1],[flag1],[points1],[atks1],[losses1],[name2],[flag2],[points2],[atks2],[losses2]\`\n**Notice arguments are comma separated so team names can have spaces.**\nUse \`{prefix}finalscore\` in the same way to show final score of fight`,
	aliases: ['finalscore'],
	execute( { message = {}, args = [], rawArgs = '', commandName = '' } ) {
		// Args are comma separated for this one, fix them
		args = rawArgs.split( /\s*,\s*/ );

		// Embed to display
		let scoreEmbed = new Discord.MessageEmbed()
			.setColor( '#9013FE' )
			.setTitle( ( 'finalscore' === commandName )? '**FINAL SCORE**' : '**LIVE SCORE**' )
			.setAuthor( message.author.username, message.author.avatarURL() )
			.addField( args[0], `${args[1]}  ${args[2]} points\n${args[1]}  ${args[3]}/40 atks left\n${args[1]}  ${args[4]} attack losses`, true )
			.addField( args[5], `${args[6]}  ${args[7]} points\n${args[6]}  ${args[8]}/40 atks left\n${args[6]}  ${args[9]} attack losses`, true )
			.setFooter( `Created with the ${config.prefix}${commandName} command` );

		return message.channel.send( scoreEmbed )
			.then( () => {
				message.delete();
			} );
	},
};
