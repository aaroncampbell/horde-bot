const config = require( '../loadConfig.js' );
const MongoClient = require('mongodb').MongoClient;

// require the discord.js module
const Discord = require( 'discord.js' );

// Turns minute-based offsets to an offset string, ex 300 -> +0500 or -150 -> -0230
const tzOffsetMinutesToString = function( m ) {
	return ((m < 0)?'-':'+') + Math.floor( Math.abs( m ) / 60 ).toString().padStart( 2, '0' ) + ( Math.abs( m ) % 60).toString().padStart( 2, '0' );
};

// Use moment-timezone for timezone handling
let moment = require('moment-timezone');

// Support GMT+-XX format for timezones
let tzAliases = {
	'gmt-12': 'Etc/GMT+12',
	'gmt-11': 'Etc/GMT+11',
	'gmt-10': 'Etc/GMT+10',
	'gmt-9':  'Etc/GMT+9',
	'gmt-8':  'Etc/GMT+8',
	'gmt-7':  'Etc/GMT+7',
	'gmt-6':  'Etc/GMT+6',
	'gmt-5':  'Etc/GMT+5',
	'gmt-4':  'Etc/GMT+4',
	'gmt-3':  'Etc/GMT+3',
	'gmt-2':  'Etc/GMT+2',
	'gmt-1':  'Etc/GMT+1',
	'gmt-0':  'GMT',
	'gmt+0':  'GMT',
	'gmt+1':  'Etc/GMT-1',
	'gmt+2':  'Etc/GMT-2',
	'gmt+3':  'Etc/GMT-3',
	'gmt+4':  'Etc/GMT-4',
	'gmt+5':  'Etc/GMT-5',
	'gmt+6':  'Etc/GMT-6',
	'gmt+7':  'Etc/GMT-7',
	'gmt+8':  'Etc/GMT-8',
	'gmt+9':  'Etc/GMT-9',
	'gmt+10': 'Etc/GMT-10',
	'gmt+11': 'Etc/GMT-11',
	'gmt+12': 'Etc/GMT-12'
};

module.exports = {
	name: 'rewards', // command name
	description: 'Display or set rewards times', // Description
	aliases: ['rewardstime'],
	usage: '[user] \\|\\| [timezone] \\|\\| [server (s## such as s60)] \\|\\| set [timezone] [server (s## such as s60)(optional)] \\|\\| delete [server (s## such as s60)(optional)]',
	onReady( client ) {
		// If the arenaRewardsSchedule is specified in config and a channel is specified as part of it
		if ( 'object' === typeof config.arenaRewardsSchedule && config.arenaRewardsSchedule.channel.toString() ) {

			const ScheduledTasks = require( '../scheduled-tasks.js' );

			client.channels.fetch( config.arenaRewardsSchedule.channel )
				// TODO: default cronTime to '15 0 * * * *'
				// TODO: default timezone to null?
				.then( channel => {
					try {
						const defaultCronTime = '15 0 * * * *';
						const CronJob = require('cron').CronJob;
						if ( ! config.arenaRewardsSchedule.timezone ) {
							config.arenaRewardsSchedule.timezone = 'UTC';
						}
						if ( tzAliases[ config.arenaRewardsSchedule.timezone.toLowerCase() ] ) {
							config.arenaRewardsSchedule.timezone = tzAliases[ config.arenaRewardsSchedule.timezone.toLowerCase() ];
						}

						if ( ! moment.tz.zone( config.arenaRewardsSchedule.timezone ) ) {
							config.arenaRewardsSchedule.timezone = null;
						}

						// If no crontime is specified, use the default.
						if ( ! config.arenaRewardsSchedule.cronTime ) {
							config.arenaRewardsSchedule.cronTime = defaultCronTime;
						} else {
							try {
								// Try the specified crontime and if it throws an error use the default
								const CronTime = require('cron').CronTime;
								new CronTime( config.arenaRewardsSchedule.cronTime );
							} catch (error) {
								config.arenaRewardsSchedule.cronTime = defaultCronTime;
							}
						}
						let job = new CronJob( config.arenaRewardsSchedule.cronTime, function() {
							module.exports.displayRewards( { channel: channel }, [], true );
						}, null, true, config.arenaRewardsSchedule.timezone );
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
	displayRewards( message, args, cron = false ) {
		MongoClient.connect( config.dbConnectionUrl, { useUnifiedTopology: true } )
			.then( client => {
				const db = client.db(config.dbName);
				const rewardsCollection = db.collection('rewards');
				// Embed to display
				let rewardsEmbed = new Discord.MessageEmbed()
					.setThumbnail('https://heroes-a.akamaihd.net/i/hw-web/promo/pages/kiss_mobile/mobile-logo-en.png')
					.setColor('#9013FE')
					.setTitle('Reward Times');

				// Start a search object to fill - empty finds all rewards
				let search = {};

				let rewardsTime = moment().utc();
				if (moment().utc().hours() < 8) {
					rewardsTime.hours(-24);
				}
				// Number of minutes between current time and 2000 UTC - essentially offset from rewards time in minutes
				let minutesDiff = rewardsTime.hours(20).minutes(0).seconds(0).diff(moment().utc(), 'minutes');

				let server;
				// If "all" rewards weren't requested, then work out search terms
				if ('all' !== args[0]) {
					// If specific users were requested
					if ( ! cron && message.mentions.users.size ) {
						search.userid = {$in: message.mentions.users.map(user => user.id)};
						rewardsEmbed.setTitle('Reward Times for Requested Users');
					} else if ( ! cron && args[0] && 's' === args[0].trim()[0] && ( server = parseInt( args[0].replace( /^s+/, '' ) ) ) ) {
						// If a server was specified, such as 's60'
						search.server = server;
						rewardsEmbed.setTitle(`Reward Times for Server ${server}`);
					} else if ( !cron && args[0] ) {
						// If there's an argument that's not set, all, or a server - assume it's a timezone
						let tzName = ( tzAliases[ args[0].toLowerCase() ] )? tzAliases[ args[0].toLowerCase() ] : args[0];
						if ( ! moment.tz.zone( tzName ) ) {
							return message.reply(`I don't recognize the \`${args[0]}\` timezone.\nYou can use this list of tz database time zones to find yours if you don't know it - https://en.wikipedia.org/wiki/List_of_tz_database_time_zones`);
						}

						// get timezone now that we know it's valid and add it's offset to search
						search.tzOffset = moment.tz( tzName ).utcOffset();
						rewardsEmbed.setTitle(`Reward Times for ${args[0]}`);
					} else {
						search.tzOffset = {
							'$gte': minutesDiff - 60,
							'$lt': minutesDiff
						};
						rewardsEmbed.setTitle('Reward Times in the Next Hour');
					}
				}

				rewardsCollection.find(search).sort({tzOffset: 1, server: 1}).toArray()
					.then(results => {
						// If there is any server in our list that doesn't match our default
						let nonDefaultServer = !!results.filter(r => r.server != config.defaultServer).length;

						if ( ! results.length ) {
							// If  this is running as a scheduled task, then we don't want to display empty results
							if ( cron ) { return; }
							rewardsEmbed.setDescription('No results found.');
						} else {
							// console.log( '**SEARCH RESULTS**\n', results )
							let userList = [];
							results.forEach(function (r, index) {
								let userString = `<@${r.userid}>`;
								if (nonDefaultServer) {
									userString += ` s${r.server}`;
								}
								userList.push(userString);

								if (results[index + 1] == undefined || r.tzOffset != results[index + 1].tzOffset) {
									let timeTo = [];
									let minutesTo = minutesDiff - r.tzOffset;

									// If rewards are past, then we want time to tomorrow's rewards
									if (minutesTo < 0) {
										minutesTo = (24 * 60) + minutesTo;
									}

									let hoursTo = Math.floor(minutesTo / 60);
									if (hoursTo === 1) {
										timeTo.push('1 hour ');
									} else if (hoursTo > 1) {
										timeTo.push(`${hoursTo} hours `);
									}

									minutesTo = minutesTo % 60;
									if (minutesTo === 1) {
										timeTo.push('1 minute ');
									} else if (minutesTo > 1) {
										timeTo.push(`${minutesTo} minutes `);
									}

									timeTo = timeTo.join(' ');

									rewardsEmbed.addField(`GMT${tzOffsetMinutesToString(r.tzOffset)} in ${timeTo}`, userList.join('\n'), true);
									userList = [];
								}
							});
						}
						message.channel.send(rewardsEmbed);
					})
					.catch(error => console.error(error));
			})
			.catch( error => console.error( error ) );
	},

	execute( { message = {}, args = [] } ) {
		MongoClient.connect( config.dbConnectionUrl, { useUnifiedTopology: true } )
			.then( client => {
				const db = client.db( config.dbName );
				const rewardsCollection = db.collection( 'rewards' );

				// Set a reward time
				if ( 'set' === args[0] ) {
					// set requires a timezone as a second arg, return with message if not specified
					if ( ! args[1] ) {
						return message.reply( `You must specify a timezone like \`${config.prefix}${this.name} set America/Chicago\`\nYou can use this list of tz database time zones to find yours if you don't know it - https://en.wikipedia.org/wiki/List_of_tz_database_time_zones` );
					}

					if ( tzAliases[ args[1].toLowerCase() ] ) {
						args[1] = tzAliases[ args[1].toLowerCase() ];
					}

					// Second arg needs to be a valid timezone, return with message if not
					if ( ! moment.tz.zone( args[1] ) ) {
						return message.reply( `I don't recognize the \`${args[1]}\` timezone.\nYou can use this list of tz database time zones to find yours if you don't know it - https://en.wikipedia.org/wiki/List_of_tz_database_time_zones` );
					}

					// set timezone now that we know it's valid
					let tz = moment.tz( args[1] );

					// Create a reward object to store
					let reward = {
						"userid": message.author.id,
						"username": message.author.username,
						"tzOffset": tz.utcOffset(),
						"server": ( args[2] && parseInt( args[2].replace( /^s+/, '' ) ) )? parseInt( args[2].replace( /^s+/, '' ) ) : config.defaultServer
					}

					// Insert reward record, or replace if userid/server combo already exists
					rewardsCollection.replaceOne( {userid:reward.userid, server:reward.server}, reward, { upsert: true} )
						.then( result => {
							// Let the user know their rewards time was set
							return message.reply( `your reward time for server ${reward.server} has been registered as GMT${tzOffsetMinutesToString( reward.tzOffset )}` );
						} )
						.catch( error => console.error( error ) );

					return;
				}

				// Delete a reward time
				if ( 'delete' === args[0] ) {
					// Create a reward object to remove
					let reward = {
						"userid": message.author.id,
						"server": ( args[1] && parseInt( args[1].replace( /^s+/, '' ) ) )? parseInt( args[1].replace( /^s+/, '' ) ) : config.defaultServer
					}

					rewardsCollection.deleteOne( reward )
						.then( result => {
							return message.reply( 'reward time removed' );
						} )
						.catch( error => console.error( error ) );

					return;
				}

				this.displayRewards( message, args );

			})
			.catch( error => console.error( error ) );

		return;
	},
};
