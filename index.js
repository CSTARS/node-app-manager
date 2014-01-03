var libUpdater = require('./lib/lib-updater.js');

var args = process.argv;
var cmd = 'default';

if( args.length > 2 ) {
	cmd = args[2];
}

if( cmd == 'update-lib' ) {
	libUpdater.run();
}