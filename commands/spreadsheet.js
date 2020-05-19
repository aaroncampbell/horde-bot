module.exports = {
	name: 'spreadsheet',
	description: 'Het a link to "the spreadsheet"',
	usage: `{prefix}${this.name}`,
	execute( { message = {} } ) {
		message.channel.send( 'https://www.dropbox.com/s/zae6k6bx5hd27p9/Hero%20Wars%20Character%20Data.xlsx?dl=0&fbclid=IwAR3hA0vUGdx_OR0HOaBfs_ksc3KIVXpmrNYSSsdqfhwE0xgTaU52mpWCSXQ' );
	},
};
