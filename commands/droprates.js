module.exports = {
	name: 'droprates',
	description: 'Hero Wars Mobile Drop Rates',
	usage: `{prefix}${this.name}`,
	execute( { message = {} } ) {
		message.channel.send( 'https://hwmobilefaq.com/faq/drop-rates/' );
	},
};
