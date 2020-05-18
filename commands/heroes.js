// require the discord.js module
const Discord = require( 'discord.js' );
const config = require( '../loadConfig.js' );

const heroData = require( '../resources/hero-data.json' );

module.exports = {
	name: 'hero', // command name
	description: 'Information about heroes', // Description
	aliases: ['heroes'],
	usage() {
		let help = '\n';
		help += `\`{prefix}${this.name} list\` - Show a list of all heroes\n`;
		help += `\`{prefix}${this.name} [hero]\` - Show details for any hero, ex: \`{prefix}${this.name} Galahad\``;
		return help;
	},
	execute( { message = {}, args = [], rawArgs = '', commandName = '' } ) {
		// If the command used was the plural an no parameters were specified, assume they want a list of all heroes
		if ( 'heroes' === commandName && !args.length ) {
			args = [ 'list' ];
		}

		// If the request is for a "list" or for "all"
		if ( [ 'list', 'all' ].includes( args[0].toLowerCase() ) ) {
			return message.channel.send( Object.keys( heroData ).join( '\n' ) );
		}

		// No hero was specified
		if ( ! args.length || ! args[0] ) {
			return message.reply( `Please specify a hero or use \`${config.prefix}${this.name} list\` to see available heroes` );
		}

		// Fixes hero names by properly capitalizing them - names are capitalized and spaces are replaced with underscores
		const fixHeroName = function ( heroName ) {
			// Split on any space, underscore, or hyphen
			// Uppercase the first letter and lowercase the rest for each part
			// Combine parts with underscores
			return heroName.split(/[\s_-]/).map(s => s[0].toUpperCase() + s.substr(1).toLowerCase()).join( '_' );
		}
		let heroName, hero;

		/**
		 * As long as there are more args and we don't have a valid hero, combine first two args and try again
		 * Handles two word names and leaves room for 3+ word names in the future
		 */
		while ( ( heroName = fixHeroName( args[0] ) ) && ! heroData[ heroName ] && args[1] ) {
			// Combine first two args with space as second arg
			args[1] = args[0] + ' ' + args[1];
			// Shift off first arg
			args.shift();
		}

		if ( heroData[ heroName ] && (hero = heroData[ heroName ]) && 'object' === typeof hero ) {
			let formatSkills = function( skills ) {
				let skillsStr = '';
				for ( let [color, skill] of Object.entries( skills ) ) {
					skillsStr += `**${color}:** ${skill.name}\n` +
						`${skill.description}\n` +
						`${skill.calculation}\n`;
				}
				return skillsStr;
			}

			// Embed to display
			let heroEmbed = new Discord.MessageEmbed()
				.setThumbnail( hero.image )
				.setColor( '#9013FE' )
				.setTitle( `**Hero Data: ${hero.name}**` )
				.setDescription( hero.description )
				.addField( '**Stone Source**', hero['stone source'], true )
				.addField( '**Main Stat**', hero['main stat'], true )
				.addField( '**Attack Type**', hero['attack type'], true )
				.addField( '**Role**', hero['role'], true )
				.addField( '**Skills**', formatSkills( hero.skills ) )
				.addField( '**Glyphs**', '```' + Object.values( hero.glyphs ).join( '\n' ) + '```' )
				.addField( '**Skins**', '```' + Object.values( hero.skins ).join( '\n' ) + '```' )
				.addField( '**Artifacts**', '```' + Object.values( hero.artifacts ).join( '\n' ) + '```' );

			return message.channel.send( heroEmbed );
		} else {
			return message.reply( `No hero found, use \`${config.prefix}${this.name} list\` to see available heroes` );
		}
	},
};
