/*
Search/Replace regex used to generate .json file from a copy/paste from the excel:

Search:
^(\d+)\s+(.*)\s+(\d+)\s+(\d+)\s+(\d+)\n\s+(.*)\s+(\d+)\s+(\d+)\s+(\d+)\n\s+(.*)\s+(\d+)\s+(\d+)\s+(\d+)\n\s+(.*)\s+(\d+)\s+(\d+)\s+(\d+)\n

Replace:
	"$1": [
		{
			"quest":  "$2",
			"repeat": "$3",
			"exp":    "$4"
		},
		{
			"quest":  "$6",
			"repeat": "$7",
			"exp":    "$8"
		},
		{
			"quest":  "$10",
			"repeat": "$11",
			"exp":    "$12"
		},
		{
			"quest":  "$14",
			"repeat": "$15",
			"exp":    "$16"
		}
	],

*/

const fs = require("fs");
const path = require("path");
const config = require( '../loadConfig.js' );
// const MongoClient = require('mongodb').MongoClient;

// require the discord.js module
const Discord = require( 'discord.js' );
const { exist } = require('mongodb/lib/gridfs/grid_store');

// Use moment-timezone for timezone handling
let moment = require('moment-timezone');

module.exports = {
	name: 'battlepass', // command name
	description: 'View current and next Battle Pass Quests', // Description
	// aliases: ['rewardstime'],
	// usage: '[user] \\|\\| [timezone] \\|\\| [server (s## such as s60)] \\|\\| set [timezone] [server (s## such as s60)(optional)] \\|\\| delete [server (s## such as s60)(optional)]',
	onReady( client ) {
		// If the arenaRewardsSchedule is specified in config and a channel is specified as part of it
		if ( 'object' === typeof config.battlepass && config.battlepass.channel.toString() ) {
			const ScheduledTasks = require( '../scheduled-tasks.js' );

			client.channels.fetch( config.battlepass.channel )
				// TODO: default cronTime to '15 0 * * * *'
				// TODO: default timezone to null?
				.then( channel => {
					try {
						const CronJob = require('cron').CronJob;

						// Battlepass changes at 2100 Central US, 0200 UTC
						let job = new CronJob( '15 0 2 * * *', function() {
							module.exports.displayBattlepass( { channel: channel }, [], true );
						}, null, true, 'UTC' );
						ScheduledTasks.jobs.push( job );
						job.start();
					} catch ( error ) {
						console.error( 'Could not start cron due to error: ', error.message );
					}
				} )
				.catch( error => {
					console.error( 'There was an error scheduling arena rewards:\n', error );
				});
		}

	},
	getQuests( date, title ) {
		let configFile = path.join( __dirname, `../battlepass.${date.getUTCMonth()+1}.${date.getUTCFullYear()}.json` );

		if ( fs.existsSync( configFile ) ) {
			const quests = require( configFile )[date.getUTCDate()];
			if ( quests ) {
				let battlepassEmbed = new Discord.MessageEmbed()
					.setThumbnail('https://heroes-a.akamaihd.net/i/hw-web/promo/pages/kiss_mobile/mobile-logo-en.png')
					.setColor('#9013FE')
					.setTitle(title);

				const maxQuestNameLength = Math.max( ...quests.map( ({ quest }) => {return quest.length} ) );
				const maxQuestRepeatLength = Math.max( ...quests.map( ({ repeat }) => {return repeat.length} ) );
				const maxQuestExpLength = Math.max( ...quests.map( ({ exp }) => {return exp.length} ) );

				quests.forEach( q => {
					battlepassEmbed.addField( q.quest, `Repeat: ${q.repeat}\nExp: ${q.exp}\nTotal: ${q.repeat*q.exp}` );
				} );
				return battlepassEmbed;
			}
			return;
		}

		return;
	},
	displayBattlepass( message, args, cron = false ) {

		// Battlepass changes at 2100 Central US, 0200 UTC
		const currentTime = new Date( new Date().getTime() - 2 * 3600 * 1000 );
		const tomorrowTime = new Date( currentTime.getTime() + 24 * 3600 * 1000 );

		let currentQuests = this.getQuests( currentTime, "Today's Battlepass Quests" );
		let tomorrowQuests = this.getQuests( tomorrowTime, "Tomorrow's Battlepass Quests" );

		if ( currentQuests ) {
			message.channel.send(currentQuests);
		}
		if ( tomorrowQuests ) {
			message.channel.send(tomorrowQuests);
		}

		if ( !cron && !currentQuests && !tomorrowQuests ) {
			return message.reply( 'No battlepass quests found for today or tomorrow.' );
		}

		return;
	},

	execute( { message = {}, args = [] } ) {
		if ( 'all' === args[0] ) {
			return message.reply( 'Sorry, the `all` arg is not yet supported' );
		}
		this.displayBattlepass( message, args );
		return;
	},
};
