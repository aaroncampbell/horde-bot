// require the discord.js module
const Discord = require( 'discord.js' );

const config = require( '../loadConfig.js' );

module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	aliases: ['commands'],
	usage: '[command name]',
	cooldown: 5,
	execute( { message = {}, args = [] } ) {
		const data = [];
		const { commands } = message.client;

		// Embed to display
		let helpEmbed = new Discord.MessageEmbed()
			.setColor('#9013FE');

		if ( ! args.length || 'pin' === args[0] ) {
			helpEmbed.setTitle( 'List of Available Commands' )
				.setDescription( commands.map( command => `\`${config.prefix}${command.name}\` - ${command.description}` ).join( '\n' ) + `\n\nYou can send \`${config.prefix}help [command name]\` to get info on a specific command!` );

			if ( 'pin' === args[0] ) {
				return message.channel.send( helpEmbed )
					.then( toPin => {
						toPin.pin();
						message.delete();
					} );
			}

			// Send in DM
			return message.author.send( helpEmbed )
				.then( () => {
					// If the user asked in a regular channel, let them know we answered via DM
					if ( message.channel.type === 'dm' ) return;
					message.reply( 'I\'ve sent you a DM with all my commands!' );
				} )
				.catch( error => {
					console.error( `Could not send help DM to ${message.author.tag}.\n`, error );
					message.reply( 'it seems like I can\'t DM you!' );
				} );
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find( c => c.aliases && c.aliases.includes( name ) );

		if ( ! command ) {
			return message.reply( 'that\'s not a valid command!' );
		}

		data.push( `**Name:** ${command.name}` );

		if ( command.aliases ) { data.push( `**Aliases:** ${command.aliases.join(', ')}` ); }
		if ( command.description ) { data.push( `**Description:** ${command.description}` ); }
		if ( command.usage ) {
			let usage = '**Usage:** ';
			if ( 'function' === typeof command.usage ) {
				usage += command.usage();
			} else if ( 'string' === typeof command.usage ) {
				usage += command.usage;
			}
			data.push( usage.replace( /{prefix}/g, config.prefix ).replace( /{commandName}/g, command.name ) );
		}

		data.push( `**Cooldown:** ${command.cooldown || 3} second(s)` );

		message.channel.send( data, { split: true } );
	},
};
