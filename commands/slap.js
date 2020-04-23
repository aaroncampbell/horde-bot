module.exports = {
	name: 'slap',
	description: 'Slap someone!',
	execute( message, args ) {
		const fish = [ 'catfish', 'trout', 'salmon', 'tuna', 'halibut']
		if ( ! message.mentions.users.size ) {
			return message.reply( 'you need to tag a user in order to slap them!' );
		}

		const userList = message.mentions.users.map( user => {
			return `${message.author} slaps ${user} with a ${fish[Math.floor(Math.random()*fish.length)]}`;
		});
		message.channel.send( userList );

	},
};