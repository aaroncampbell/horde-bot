module.exports = {
	name: 'args-info',
	description: 'Argument Info!',
	args: true,
	execute( message, args ) {
		if ( args[0] === 'foo' ) {
			return message.channel.send( 'bar' );
		}

		message.channel.send( `Command name: ${command}\nFirst argument: ${args[0]}\nArguments: ${args}` );
	},
};