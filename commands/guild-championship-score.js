// require the discord.js module
const Discord = require( 'discord.js' );

module.exports = {
	name: 'gcs', // command name
	description: 'Give Guild Championship match scores and get points estimate for each guild', // Description
	args: 2, // If args are required for this command
	usage: '{prefix}{commandName} [score-1] [score-2]', // Usage to offer to user
	aliases: ['gcp'],
	execute( { message = {}, args = [] } ) {
		const config = require('../config.json');
		// Command to execute

		if ( args.length ) {
			let score1 = Number( args.shift() );
			let score2 = ( args.length )? Number( args.shift() ) : 0;
			let points1 = 0;
			let points2 = 0;

			if ( score1 == score2 ) {
				points1 = 500;
				points2 = 500;
			} else {
				points1 = Math.round( ( score1 > score2? 500: 0 ) + ( 500 / ( score1 + score2 ) * score1 ) ).toString().padStart(4);
				points2 = Math.round( ( score2 > score1? 500: 0 ) + ( 500 / ( score1 + score2 ) * score2 ) ).toString().padStart(4);
			}

			let scoresEmbed = new Discord.MessageEmbed()
				.setColor( '#9013FE' )
				.setDescription(
					'```' +
					'       Score  Points\n' +
					`Team1: ${score1}   ${points1}\n` +
					`Team2: ${score2}   ${points2}\n` +
					'```'
				);
			
			return message.channel.send( scoresEmbed );
		}
	},
};
