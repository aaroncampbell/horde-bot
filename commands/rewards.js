// require the discord.js module
const Discord = require( 'discord.js' );

module.exports = {
	name: 'rewards', // command name
	description: 'Display or set rewards times', // Description
	aliases: ['rewardstime'],
	usage: '[user] || [timezone] || [server (s## such as s60)] || set [timezone] [server (s## such as s60)(optional)] || delete [server (s## such as s60)(optional)]',
	execute( message, args ) {

		const config = require('../config.json');
		const MongoClient = require('mongodb').MongoClient;


		MongoClient.connect( config.dbConnectionUrl, { useUnifiedTopology: true } )
			.then( client => {
				const db = client.db( config.dbName );
				const rewardsCollection = db.collection( 'rewards' );

				// Use moment-timezone for timezone handling
				let moment = require('moment-timezone');

				// Turns minute-based offsets to an offset string, ex 300 -> +0500 or -150 -> -0230
				function tzOffsetMinutesToString( m ) {
					return ((m < 0)?'-':'+') + Math.floor( Math.abs( m ) / 60 ).toString().padStart( 2, '0' ) + ( Math.abs( m ) % 60).toString().padStart( 2, '0' );
				}

				// Set a reward time
				if ( 'set' === args[0] ) {
					// set requires a timezone as a second arg, return with message if not specified
					if ( ! args[1] ) {
						return message.reply( `You must specify a timezone like \`${config.prefix}${this.name} set America/Chicago\`\nYou can use this list of tz database time zones to find yours if you don't know it - https://en.wikipedia.org/wiki/List_of_tz_database_time_zones` );
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

				// Embed to display
				let rewardsEmbed = new Discord.MessageEmbed()
					.setThumbnail( 'https://heroes-a.akamaihd.net/i/hw-web/promo/pages/kiss_mobile/mobile-logo-en.png' );
				rewardsEmbed.setTitle( 'Reward Times' );

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
				if ( 'all' !== args[0] ) {
					// If specific users were requested
					if (message.mentions.users.size) {
						search.userid = {$in: message.mentions.users.map(user => user.id)};
						rewardsEmbed.setTitle( 'Reward Times for Requested Users' );
					} else if( args[0] && 's' === args[0].trim()[0] && (server = parseInt( args[0].replace( /^s+/, '' ) ) ) ) {
						// If a server was specified, such as 's60'
						search.server = server;
						rewardsEmbed.setTitle( `Reward Times for Server ${server}` );
					} else if( args[0] ) {
						// If there's an argument that's not set, all, or a server - assume it's a timezone

						if ( ! moment.tz.zone( args[0] ) ) {
							return message.reply( `I don't recognize the \`${args[0]}\` timezone.\nYou can use this list of tz database time zones to find yours if you don't know it - https://en.wikipedia.org/wiki/List_of_tz_database_time_zones` );
						}

						// get timezone now that we know it's valid and add it's offset to search
						search.tzOffset = moment.tz( args[0] ).utcOffset();
						rewardsEmbed.setTitle( `Reward Times for ${args[0]}` );
					} else {
						search.tzOffset = {
							'$gte': minutesDiff - 60,
							'$lt': minutesDiff
						};
						rewardsEmbed.setTitle('Reward Times in the Next Hour');
					}
				}
				// console.log( '**SEARCH**\n', search );

				rewardsCollection.find( search ).sort( { tzOffset: 1, server: 1 } ).toArray()
					.then( results => {
						// If there is any server in our list that doesn't match our default
						let nonDefaultServer = !!results.filter( r => r.server != config.defaultServer ).length;

						if ( !results.length ) {
							rewardsEmbed.setDescription( 'No results found.' );
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
									rewardsEmbed.setColor('#9013FE');
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
						message.channel.send( rewardsEmbed );
					} )
					.catch( error => console.error( error ) );
			})
			.catch( error => console.error( error ) );

		return;
	},
};
