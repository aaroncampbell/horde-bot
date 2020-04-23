// Process .env file into process.env
require('dotenv').config();
const prefix = (process.env.PREFIX)? process.env.PREFIX:'!';

// require the discord.js module
const Discord = require('discord.js');

// create a new Discord client
const client = new Discord.Client();

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
	console.log('Ready!');
});

// Run on every message
client.on('message', message => {

	// Ignore messages not meant for us
	if ( ! message.content.startsWith( prefix ) || message.author.bot ) { return; }

	// Fill args with all content of the message, removing prefix and exploding on spaces
	const args = message.content.slice( prefix.length ).split( / +/ );
	// The command is the first argument
	const command = args.shift().toLowerCase();

	// Process ping and beep
	if ( message.content.startsWith( `${prefix}ping` ) ) {
		message.channel.send( 'Pong.' );
	} else if ( message.content.startsWith( `${prefix}beep` ) ) {
		message.channel.send( 'Boop.' );
	} else if ( message.content === `${prefix}server` ) {
		message.channel.send( `Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}` );
	} else if ( message.content === `${prefix}user-info` ) {
		message.channel.send( `Your username: ${message.author.username}\nYour ID: ${message.author.id}` );
	} else if ( command === 'args-info' ) {
		if ( ! args.length ) {
			return message.channel.send( `You didn't provide any arguments, ${message.author}!` );
		} else if ( args[0] === 'foo' ) {
			return message.channel.send( 'bar' );
		}

		message.channel.send( `Command name: ${command}\nFirst argument: ${args[0]}\nArguments: ${args}` );
	} else if ( command === 'smack' ) {
		if ( ! message.mentions.users.size ) {
			return message.reply( 'you need to tag a user in order to kick them!' );
		}

		const userList = message.mentions.users.map( user => {
			return `${message.author} smacks ${user.username}`;
		});
		message.channel.send( userList );
	} else if ( command === 'avatar' ) {
		if ( ! message.mentions.users.size ) {
			return message.channel.send( `Your avatar: <${message.author.displayAvatarURL({ format: "png", dynamic: true })}>` );
		}

		const avatarList = message.mentions.users.map( user => {
			return `${user.username}'s avatar: <${user.displayAvatarURL( { format: "png", dynamic: true } )}>`;
		} );

		// send the entire array of strings as a message
		// by default, discord.js will `.join()` the array with `\n`
		message.channel.send( avatarList );
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