// Default config - loaded config overwrites this
const config = {
	prefix:'!'
};

// Load config file and merge with our defaults
Object.assign( config, require( './config.json' ) );

module.exports = config;
