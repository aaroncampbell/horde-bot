module.exports = {
	name: 'ping',
	description: 'Ping!',
	cooldown: 5,
	execute( message, args ) {
		message.channel
			.send('ping')
			.then(m =>
				m.edit(
					`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms.`
				)
			)
			.catch( error => console.error( error ) );
	},
};
