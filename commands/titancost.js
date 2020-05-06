// require the discord.js module
const Discord = require( 'discord.js' );

module.exports = {
	name: 'titancost', // command name
	description: 'Titan Upgrade Costs', // Description
	aliases: ['titancosts'],
	execute( message, args ) {
		// Command to execute
		let titanCosts = [0,100,110,120,130,140,150,160,170,180,190,200,210,220,230,240,250,260,270,280,290,300,310,320,330,340,350,360,370,380,390,440,490,540,590,640,690,740,790,840,890,940,990,1040,1090,1140,1190,1240,1290,1340,1390,1490,1590,1690,1790,1890,1990,2090,2190,2290,2390,2490,2590,2690,2790,2890,2990,3090,3190,3290,3390,3590,3790,3990,4190,4390,4590,4790,4990,5190,5390,5590,5990,6390,6790,7190,7590,7990,8390,8790,9190,9590,9990,10390,10790,11190,11590,11990,12390,12790,13390,13990,14590,15190,15790,16390,16690,17590,18190,18790,19590,20390,21190,21990,22790,23590,24390,25190,25990,26790];

		const prioritiesEmbed = new Discord.MessageEmbed()
			.setColor( '#9013FE' )
			.setTitle( 'Cost to Level Up Titans' )
			.setThumbnail( 'https://heroes-a.akamaihd.net/i/hw-web/promo/pages/kiss_mobile/mobile-logo-en.png' );

		// These are broken up into multiple fields due to length limits for messages and fields, not just because of the amount of data
		let perField = 30;
		let fieldTitanCosts = [];
		let header = 'Level       Potions Gems';
		titanCosts.forEach( function ( potions, level ) {
			//if ( 0 === level ) { return; }
			fieldTitanCosts.push( `${level.toString().padEnd( 3, ' ' )} -> ${(level+1).toString().padEnd( 3, ' ' )}  ${potions.toString().padEnd( 5, ' ' )}   ${potions/5}` );
			if ( fieldTitanCosts.length === perField ) {
				fieldTitanCosts.unshift( header );
				prioritiesEmbed.addField( `Levels ${level-perField+1} - ${level+1}`, '```' + fieldTitanCosts.join( '\n' ) + '```' );
				fieldTitanCosts = [];
			}
		} );
		message.channel.send( prioritiesEmbed );
	},
};
