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
		help += `\`{prefix}{commandName} list\` - Show a list of all heroes\n`;
		help += `\`{prefix}{commandName} stats [hero]\` - Show stats for any hero, ex: \`{prefix}{commandName} stats Galahad\`\n`;
		help += `\`{prefix}{commandName} skills [hero]\` - Show skills for any hero, ex: \`{prefix}{commandName} skills Galahad\`\n`;
		help += `\`{prefix}{commandName} guide [hero]\` - Show usage guide for any hero, ex: \`{prefix}{commandName} guide Galahad\``;
		return help;
	},
	execute( { message = {}, args = [], rawArgs = '', commandName = '' } ) {
		// If the command used was the plural an no parameters were specified, assume they want a list of all heroes
		if ( 'heroes' === commandName && !args.length ) {
			args = [ 'list' ];
		}

		let type = 'stats';

		// If a valid type is the first argument, shift it off and use it.
		if ( [ 'list', 'skills', 'stats', 'guide' ].includes( args[0].toLowerCase() ) ) {
			type = args.shift().toLowerCase();
		}

		// If the request is for a "list"
		if ( 'list' === type ) {
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
			return heroName.split(/[\s_-]/).map(s => s[0].toUpperCase() + s.substr(1).toLowerCase()).join( ' ' );
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
				let skillsArr = [];
				for ( let [color, skill] of Object.entries( skills ) ) {
					skillsArr.push( `**${color}:** ${skill.name}\n` +
						`${skill.description}\n` +
						`${skill.calculation}` );
				}
				return skillsArr;
			}

			let file = new Discord.MessageAttachment( `./resources/images/${heroName.replace( / /g, '-' )}.png`, 'hero.png' );

			let maxLabelLen = Math.max( ... ( Object.keys( hero.stats ).map( el => el.length ) ) );
			let maxStatLen = Math.max( ... ( Object.values( hero.stats ).map( el => el.length ) ) );

			// Embed to display
			let heroEmbed = new Discord.MessageEmbed()
				.attachFiles( [ file ] )
				.setThumbnail( 'attachment://hero.png' )
				.setColor( '#9013FE' )
				.setTitle( `**Hero Data: ${hero.name}**` )
				.setDescription( hero.description )
				.addField( '**Stone Source**', (hero['stone source'])? hero['stone source'] : '**Coming Soon**', true )
				.addField( '**Main Stat**', (hero['main stat'])? hero['main stat'] : '**Coming Soon**', true )
				.addField( '**Attack Type**', (hero['attack type'])? hero['attack type'] : '**Coming Soon**', true )
				.addField( '**Role**', (hero['role'])? hero['role'] : '**Coming Soon**', true );
			if ( 'skills' === type ) {
				heroEmbed.addField('**Skills**', formatSkills(hero.skills).join('\n\n'));
			}
			if ( 'stats' === type ) {
				heroEmbed.addField( '**Stat Priorities**', '```\n' + Object.values( hero.priorities ).join( '\n' ) + '```' )
					.addField('**Glyphs**', '```\n' + Object.values(hero.glyphs).join('\n') + '```')
					.addField('**Skins**', '```\n' + Object.values(hero.skins).join('\n') + '```')
					.addField('**Artifacts**', '```\n' + Object.values(hero.artifacts).join('\n') + '```')
					.addField('**Max Stats**', '```\n' + Object.keys(hero.stats).map(k => {
						return (k + ':').padEnd(maxLabelLen + 1) + hero.stats[k].padStart(maxStatLen);
					}).join('\n') + '```');
			}
			if ( 'guide' === type ) {
				// Require FS
				const fs = require( 'fs' );

				let usage,teams;

				try {
					usage = fs.readFileSync(`./resources/info.hero.${heroName.toLowerCase().replace(' ', '')}.usage`, 'utf8');
				} catch ( error ) {
					if ( error.code === 'ENOENT' ) {
						usage = '**Coming Soon**';
					} else {
						console.error( error );
					}
				}
				if ( ! usage.trim() ) {
					usage = '**Coming Soon**';
				}
				heroEmbed.setDescription( usage )
					.addField( '**Stat Priorities**', '```\n' + Object.values( hero.priorities ).join( '\n' ) + '```' );

				try {
					teams = fs.readFileSync(`./resources/info.hero.${heroName.toLowerCase().replace(' ', '')}.teams`, 'utf8');
				} catch ( error ) {
					if ( error.code === 'ENOENT' ) {
						teams = '**Coming Soon**';
					} else {
						console.error( error );
					}
				}
				if ( ! teams.trim() ) {
					teams = '**Coming Soon**';
				}
				heroEmbed.addField('**Example Teams**', teams )
				//heroEmbed.addField();
			}

			return message.channel.send( heroEmbed );
		} else {
			return message.reply( `No hero found, use \`${config.prefix}${this.name} list\` to see available heroes` );
		}
	},
};
