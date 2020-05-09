const config = require('./config.json');
const prefix = ( config.prefix )? config.prefix : '!';
const CronJob = require( 'cron' ).CronJob;

// Require FS
const fs = require( 'fs' );

// require the discord.js module
const Discord = require( 'discord.js' );

// create a new Discord client
const client = new Discord.Client( { partials: ['MESSAGE', 'CHANNEL', 'REACTION'] } );
client.commands = new Discord.Collection();

/**
 * Used to send a message to a channel given a channel ID and the message to send
 */
client.sendMessage = function ( channelID, message ) {
	// If there is no message, don't even try
	if ( ! message.toString().length ) return;
	client.channels.fetch( channelID )
		.then( channel => {
			// TODO: Make sure there's a message to send
			channel.send( message );
		} )
		.catch( error => {
			console.error( 'There was an error using sendMessage:\n', error );
		});
}

const commandFiles = fs.readdirSync( './commands' ).filter( file => file.endsWith( '.js' ) );

for ( const file of commandFiles ) {
	const command = require( `./commands/${file}` );
	client.commands.set( command.name, command );
}

// Cooldowns
const cooldowns = new Discord.Collection();

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
	console.log( 'Ready!' );

	// If we have tasks to schedule
	if ( config.scheduledTasks && Array.isArray( config.scheduledTasks ) && config.scheduledTasks.length ) {
		config.scheduledTasks.forEach( c => {
			// We only support sending messages right now & must have a message to send and a channel to send it to
			if ( 'sendMessage' !== c.task || !c.channel.toString() || !c.message.toString() ) {
				return;
			}

			try {
				let job = new CronJob( c.cronTime, function() {
					client.sendMessage( c.channel, c.message );
				}, null, true, c.timezone );
				job.start();
			} catch ( error ) {
				console.error( 'Could not start cron due to error: ', error.message );
			}
		} );
	}
	/**/
});

// Run on every message
client.on( 'message', message => {

	// Ignore messages not meant for us
	if ( ! message.content.startsWith( prefix ) ) { return; }

	// Fill args with all content of the message, removing prefix and exploding on spaces
	const args = message.content.slice( prefix.length ).split( / +/ );
	// The command is the first argument
	const commandName = args.shift().toLowerCase();
	const rawArgs = message.content.slice( prefix.length + commandName.length ).trim();

	const command = client.commands.get(commandName)
		|| client.commands.find( cmd => cmd.aliases && cmd.aliases.includes( commandName ) );

	if ( ! command ) { return; }

	// For commands that are only available in a regular server channel
	if ( command.guildOnly && 'text' !== message.channel.type ) {
		return message.reply( 'I can\'t execute that command inside DMs!' );
	}

	// When limited to certain channels
	if ( command.allowedInChannels || ( config.commandsAllowedInChannels && config.commandsAllowedInChannels[command.name] ) ) {
		let allowedChannels = [].concat( command.allowedInChannels, config.commandsAllowedInChannels[command.name] ).filter( c => c !== undefined );
		if ( ! allowedChannels.includes( message.channel.id ) ) {
			return message.reply( `that command is only for use in <#${allowedChannels.join( '>, <#' )}>` );
		}
	}

	// When Args are required
	if ( command.args && ! args.length ) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		// If a usage is specified, offer that to the user
		if ( command.usage ) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}
		return message.channel.send( reply );
	}

	// Each command needs it's own cooldown collection
	if ( !cooldowns.has( command.name ) ) {
		cooldowns.set( command.name, new Discord.Collection() );
	}

	const now = Date.now();
	const timestamps = cooldowns.get( command.name );
	// Cooldown in ms - 3 second default
	const cooldownAmount = ( command.cooldown || 3 ) * 1000;

	// If three's
	if ( timestamps.has( message.author.id ) ) {
		const expirationTime = timestamps.get( message.author.id ) + cooldownAmount;

		if ( now < expirationTime ) {
			const timeLeft = ( expirationTime - now ) / 1000;
			return message.reply( `please wait ${timeLeft.toFixed( 1 )} more second(s) before reusing the \`${prefix}${command.name}\` command.` );
		}
	}

	// Add the last-used timestamp for the author for this command
	timestamps.set( message.author.id, now );
	// Set a timeout to remove that last used timestamp
	setTimeout( () => timestamps.delete( message.author.id ), cooldownAmount );

	try {
		command.execute( message, args, rawArgs );
	} catch ( error ) {
		console.error( error );
		message.reply( 'there was an error trying to execute that command!' );
	}

});


process.on( 'unhandledRejection', error => console.error( 'Uncaught Promise Rejection', error ) );

// login to Discord
client.login( config.token );
