'use strict';

const config = require( './loadConfig.js' );

// require the discord.js module
const Discord = require( 'discord.js' );

// create a new Discord client
const client = new Discord.Client();

// login to Discord
client.login( config.token );

const CronJob = require('cron').CronJob;

/**
 * Used to send a message to a channel given a channel ID and the message to send
 */
client.sendMessage = function ( channelID, message ) {
	// If there is no message, don't even try
	if ( ! message.toString().length ) return;
	client.channels.fetch( channelID )
		.then( channel => {
			channel.send( message );
		} )
		.catch( error => {
			console.error( 'There was an error using sendMessage:\n', error );
		});
}

const jobs = [];

const startAll = function() {
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
				jobs.push( job );
				job.start();
			} catch ( error ) {
				console.error( 'Could not start cron due to error: ', error.message );
			}
		} );
	}

}

module.exports = { jobs, startAll };



