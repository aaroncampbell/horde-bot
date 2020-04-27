// require the discord.js module
const Discord = require( 'discord.js' );

module.exports = {
	name: 'leaderboard', // command name
	description: 'See the leaderboard or set scores for matches', // Description
	usage: '[date (optional)]', // Usage to offer to user
	aliases: ['scores'],
	execute( message, args, rawArgs ) {
		const config = require('../config.json');
		const MongoClient = require('mongodb').MongoClient;


		MongoClient.connect( config.dbConnectionUrl, { useUnifiedTopology: true } )
			.then( client => {
				const db = client.db( config.dbName );
				const scoresCollection = db.collection( 'scores' );

				// Set a score
				if ( 'set' === args[0] ) {
					/**
					 * Set a score using `scores set` with JSON containing necessary data:
					 * !scores set {"date": "2020-04-27", "team1": "The Horde", "score1": 1350, "team2": "Left4Dead 2", "score2": 1000}
					 */
					// Slice off 'set', trim whitespace, and parse JSON object
					let score = JSON.parse( rawArgs.slice( 3 ).trim() );

					score.date = new Date( score.date );
					scoresCollection.replaceOne( {date:score.date, team1:score.team1, team2:score.team2}, score, { upsert: true} )
						.then( result => {
							return message.reply( 'score added' );
						} )
						.catch( error => console.error( error ) );

					return;
				}

				/**
				 * Handle Displaying Scores
				 */

				let dateRequested = new Date( args.join() );

				// If the given args could no be processed into a valid date, use today
				if ( isNaN( dateRequested.getTime() ) ) {
					dateRequested = new Date();
				}
				let startDate = new Date( dateRequested.getTime() );

				if ( 1 !== startDate.getUTCDay() ) {
					let day = startDate.getUTCDay() || 7;
					if( day !== 1 ) {
						startDate.setUTCHours(-24 * (day - 1));
					}
				}

				let endDate = new Date( startDate );
				endDate.setUTCHours( 24 * 4 );

				const dateFormat = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone:'UTC' });
				const [{ value: startMonth },,{ value: startDay },,{ value: startYear }] = dateFormat.formatToParts( startDate );
				const [{ value: endMonth },,{ value: endDay },,{ value: endYear }] = dateFormat.formatToParts( endDate );

				let search = {
					date: {
						// Fix date because JS does some stuff in local timezone and some in UTC but Mongo wants UTC
						'$gte': startDate,
						'$lte': endDate
					}
				};

				scoresCollection.find( search ).sort( { date: 1 } ).toArray()
					.then( results => {
						let scoresEmbed = new Discord.MessageEmbed()
							.setColor( '#9013FE' )
							.setTitle( `Leaderboard for ${startYear}-${startMonth}-${startDay} to ${endYear}-${endMonth}-${endDay}` );

						let description = '';

						if ( !results.length ) {
							description = 'No scores found.';
						} else {

							let maxLength = 0;
							let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

							// Loop through results to get max team name length for formatting purposes
							results.forEach(r => {
								maxLength = Math.max(maxLength, r.team1.length);
							});

							let previousDate = '';
							let totals = {};
							results.forEach(r => {
								if (r.date.toDateString() != previousDate) {
									let d = new Date(r.date);
									if (description.length) {
										description += '```';
									}
									description += `**${days[r.date.getUTCDay()]}**\n\`\`\``;
									previousDate = r.date.toDateString();
								}
								if (!totals[r.team1]) {
									totals[r.team1] = 0;
								}
								if (!totals[r.team2]) {
									totals[r.team2] = 0;
								}
								totals[r.team1] += r.score1;
								totals[r.team2] += r.score2;
								r.score1 = `${r.score1}`.padStart(4);
								r.score2 = `${r.score2}`.padEnd(4);
								// Scores
								description += `${r.team1.padStart(maxLength)} ${r.score1} - ${r.score2} ${r.team2}\n`;
							});
							description += '```';

							// Move team totals into sortable array
							let sortTotals = [];
							for (let team in totals) {
								sortTotals.push({'team': team, 'total': totals[team]});
							}

							// Sort totals array in reverse order
							sortTotals.sort(function (a, b) {
								return b['total'] - a['total'];
							});

							// Add totals to the embed
							description += '**Totals**\n\`\`\`';
							sortTotals.forEach(function (t, index) {
								// Left Pad total & right pad team name for alignment
								t.total = `${t.total}`.padStart(4);
								t.team = t.team.padEnd(maxLength);
								description += `${index + 1}. ${t.team} ${t.total}\n`
							});
							description += '```';
						}

						scoresEmbed.setDescription( description );

						message.channel.send( scoresEmbed );
					} )
					.catch( error => console.error( error ) );
			})
			.catch( error => console.error( error ) );
	},
};
