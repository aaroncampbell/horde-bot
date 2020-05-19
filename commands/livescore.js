// require the discord.js module
const Discord = require( 'discord.js' );

module.exports = {
	name: 'livescore', // command name
	description: 'Used to display scores of matches.', // Description
	args: true, // If args are required for this command
	usage: `\`{prefix}${this.name} [name1],[flag1],[points1],[atks1],[losses1],[name2],[flag2],[points2],[atks2],[losses2]\`\n**Notice arguments are comma separated so team names can have spaces.**\nUse \`{prefix}finalscore\` in the same way to show final score of fight`,
	aliases: ['finalscore'],
	execute( { message = {}, args = [], rawArgs = '', commandName = '' } ) {
		// Args are comma separated for this one, fix them
		args = rawArgs.split( /\s*,\s*/ );

		console.log( message.author );
		// Embed to display
		let scoreEmbed = new Discord.MessageEmbed()
			.setColor( '#9013FE' )
			.setTitle( ( 'finalscore' === commandName )? '**FINAL SCORE**' : '**LIVE SCORE**' )
			.setAuthor( message.author.username, message.author.avatarURL() )
			.addField( args[0], `${args[1]}  ${args[2]} points\n${args[1]}  ${args[3]}/40 atks left\n${args[1]}  ${args[4]} attack losses`, true )
			.addField( args[5], `${args[6]}  ${args[7]} points\n${args[6]}  ${args[8]}/40 atks left\n${args[6]}  ${args[9]} attack losses`, true );

		return message.channel.send( scoreEmbed );

		console.log( args );
		//message.channel.send( args.join( '\n' ) );

		let livescore = {
			"fields": [{
				"name": "{args(1):,}",
				"value": "{args(2):,}  {args(3):,} points\n{args(2):,}  {args(4):,}/40 atks left\n{args(2):,}  {args(5):,} attack losses",
				"inline": true
			}, {
				"name": "{args(6):,}",
				"value": "{args(7):,} {args(8):,} points\n{args(7):,} {args(9):,}/40 atks left\n{args(7):,} {args(10):,} attack losses",
				"inline": true
			}], "title": "LIVE SCORE",
			"author": {"name": "{user}", "icon_url": "{user(avatar)}"}, "color": 10197915
		};
		let finalscore = {
			"fields": [{
				"name": "{args(1):,}",
				"value": "{args(2):,}  {args(3):,} points\n{args(2):,}  {args(4):,}/40 atks left\n{args(2):,}  {args(5):,} attack losses",
				"inline": true
			}, {
				"name": "{args(6):,}",
				"value": "{args(7):,} {args(8):,} points\n{args(7):,} {args(9):,}/40 atks left\n{args(7):,} {args(10):,} attack losses",
				"inline": true
			}], "title": "FINAL SCORE", "author": {"name": "{user}", "icon_url": "{user(avatar)}"}, "color": 8311585
		};
	},
};
/*
{"fields":[{"name":"{args(1):,}","value":"{args(2):,}  {args(3):,} points\n{args(2):,}  {args(4):,}/40 atks left\n{args(2):,}  {args(5):,} attack losses","inline":true},{"name":"{args(6):,}","value":"{args(7):,} {args(8):,} points\n{args(7):,} {args(9):,}/40 atks left\n{args(7):,} {args(10):,} attack losses","inline":true}],"title":"LIVE SCORE","author":{"name":"{user}","icon_url":"{user(avatar)}"},"color":10197915}
 */
