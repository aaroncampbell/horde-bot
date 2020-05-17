// require the discord.js module
const Discord = require( 'discord.js' );

module.exports = {
	name: 'armor', // command name
	description: 'How energy builds', // Description
	usage: '[armor/mdef] [pen/mpen]', // Usage to offer to user
	aliases: ['defense', 'pen', 'penetration', 'mdef', 'mpen'],
	execute( { message = {}, args = [] } ) {
		const config = require('../config.json');
		// Command to execute

		if ( args.length ) {
			let armor = Number( args.shift() );
			let pen = ( args.length )? Number( args.shift() ) : 0;
			let dmgReduction = (1-1/(1+Math.max( armor-pen, 0 )/3000))*100;
			dmgReduction = Math.round((dmgReduction + Number.EPSILON) * 10000) / 10000;

			const armorEmbed = new Discord.MessageEmbed()
				.setColor( '#9013FE' )
				.setTitle( `Damage Reduction: ${dmgReduction}%` )
				.setDescription(
					`Armor/mdef: ${armor}\n` +
					`Apen/mpen: ${pen}`
				);
			return message.channel.send( armorEmbed );
		}

		const armorEmbed = new Discord.MessageEmbed()
			.setColor( '#9013FE' )
			.setTitle( 'How Armor/Penetration and Magic Defense/Penetration Work' )
			.setDescription(
				'*Armor* reduces physical damage, armor penetration (pen) counteracts this.\n' +
				'*Magic* defense (mdef) reduces magical damage and is counteracted with magic penetration (mpen).\n' +
				'Both are calculated the same way:\n' +
				'**Armor/mdef**\n' +
				'There is a formula that allows to calculate the percentage of reduced damage:\n' +
				'`( 1 - 1 / ( 1 + [armor/mdef] / 3000 ) ) * 100%`\n' +
				'Reference points:\n' +
				'500 armor - ~14% damage reduction\n' +
				'1000 armor - 25% damage reduction\n' +
				'2000 armor - 40% damage reduction\n' +
				'3000 armor - 50% damage reduction\n' +
				'4000 armor - ~57% damage reduction\n' +
				'8000 armor - ~72% damage reduction\n' +
				'12000 armor - 80% damage reduction\n' +
				'\n' +
				'Example:\n' +
				'Let\'s say that a hero has an armor value of 3000. That would be a 50% reduction (`(1-1/(1+3000/3000))*100 = 50%`). That means if initial damage is 5000, the hero will only take 2500 actual damage.\n' +
				'\n' +
				'**Armor/Magic Penetration**\n' +
				'1 point in Armor/Magic penetration reduces the appropriate defense stat by 1 point\n' +
				'\n' +
				'If a hero has 1000 of Armor Penetration and their opponent has 3000 of Armor stat, only 2000 of Armor will affect the incoming damage. So instead of damage dealt being reduced by 50% it would be reduced by 40% (see reference points above).\n' +
				'\n' +
				'In case the Armor/Magic penetration stat is greater than Armor/Magic defense of a target, incoming damage will be received fully, without any reduction.\n' +
				'\n' +
				'**Easy Armor/Magic Defense Calculation**\n' +
				'You can use this command to calculate armor with or without penetration:\n' +
				`To calculate just armor/mdef use \`${config.prefix}${this.name} [armor/mdef]\`\n` +
				`Example: \`${config.prefix}${this.name} 3000\`\n` +
				`To calculate armor/mdef with apen/mpen use \`${config.prefix}${this.name} [armor/mdef] [apen/mpen]\`\n` +
				`Example: \`${config.prefix}${this.name} 3000 1000\`\n` +
				'[Source](https://herowars.zendesk.com/hc/en-us/articles/360039320594-Armor-Magic-Defense-and-Armor-Magic-Penetration-)' );

		message.channel.send( armorEmbed );
	},
};
