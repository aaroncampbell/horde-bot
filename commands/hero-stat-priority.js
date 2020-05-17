// require the discord.js module
const Discord = require( 'discord.js' );

module.exports = {
	name: 'hero-stat-priority', // command name
	description: 'See what hero stats should be focused on', // Description
	aliases: ['hero-stats', 'priority'],
	execute( { message = {} } ) {
		// Command to execute
		const prioritiesEmbed = new Discord.MessageEmbed()
			.setColor( '#9013FE' )
			.setTitle( 'Stat Priorities' )
			.setDescription( 'Stat priority types for each hero type. These apply to glyphs, skins, and artifacts. In general it\'s best to focus on maxing out the priority stats before moving on to the next.' )
			.addFields(
				{
					"name": "DPS",
					"value": "```1. Penetration\n2. Attack\n3. Main Stat\n4. Health\n5. Defense```",
					"inline": true
				}, {
					"name": "Tanks",
					"value": "```1. Defense\n2. Health\n3. Main Stat\n4. Attack\n5. Penetration```",
					"inline": true
				}, {
					"name": "Support / Control / Healer",
					"value": "```1. Health\n2. Main Stat\n3. Defense\n4. Attack```",
					"inline": true
				}, {
					"name": "Nebula",
					"value": "```1. Attack\n2. Main Stat\n3. Health\n4. Defense```",
					"inline": true
				}, {
					"name": "Celeste",
					"value": "```1. Penetration\n2. Health\n3. Attack\n4. Main Stat\n5. Defense```",
					"inline": true
				}, {
					"name": "Andvari",
					"value": "```1. Health\n2. Strength\n4. Penetration\n5. Attack\n6. Armor```",
					"inline": true
				}, {
					"name": "Lilith",
					"value": "```1. Health\n2. Main Stat\n3. Defense\n4. Penetration\n5. Attack```",
					"inline": true
				}, {
					"name": "Aurora",
					"value": "```1. Dodge\n2. Health\n3. Strength\n4. Penetration\n5. Attack\n6. Armor```",
					"inline": true
				}, {
					"name": "Glossary",
					"value": "```DPS = Warriors / Marksmen / Mages\nAttack = Physical / Magic Attack\nPenetration = Armor / Magic Penetration\nDefense = Armor / Magic Defense\nMain Stat = Strength / Intelligence / Agility```",
					"inline": false
				}
			);

		message.channel.send( prioritiesEmbed );
	},
};
