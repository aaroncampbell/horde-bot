// Process .env file into process.env
require( 'dotenv' ).config();
const prefix = ( process.env.PREFIX )? process.env.PREFIX : '!';

// Require FS
const fs = require( 'fs' );

// require the discord.js module
const Discord = require( 'discord.js' );

// create a new Discord client
const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync( './commands' ).filter( file => file.endsWith( '.js' ) );

for ( const file of commandFiles ) {
	const command = require( `./commands/${file}` );
	client.commands.set( command.name, command );
}

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
	console.log( 'Ready!' );
});

// Run on every message
client.on( 'message', message => {

	// Ignore messages not meant for us
	if ( ! message.content.startsWith( prefix ) || message.author.bot ) { return; }

	// Fill args with all content of the message, removing prefix and exploding on spaces
	const args = message.content.slice( prefix.length ).split( / +/ );
	// The command is the first argument
	const commandName = args.shift().toLowerCase();

	if ( ! client.commands.has( commandName ) ) { return; }

	const command = client.commands.get(commandName);

	// For commands that are only available in a regular server channel
	if ( command.guildOnly && 'text' !== message.channel.type ) {
		return message.reply( 'I can\'t execute that command inside DMs!' );
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

	try {
		command.execute( message, args );
	} catch ( error ) {
		console.error( error );
		message.reply( 'there was an error trying to execute that command!' );
	}

	console.log(message);
});

// login to Discord
client.login( process.env.TOKEN );

/*
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

MongoClient.connect(url, function(err, db) {
	if (err) throw err;
	console.log("Database created!");
	db.close();
});
 */
