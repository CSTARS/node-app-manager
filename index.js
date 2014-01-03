var libUpdater = require('./lib/lib-updater.js');
var gitUpdater = require('./lib/git-updater.js');
var npmUpdater = require('./lib/npm-updater.js');

var args = process.argv;
var cmd = 'update';

if( args.length > 2 ) {
	cmd = args[2];
}

if( cmd == 'update-lib' ) {
	libUpdater.run();
} else if ( cmd == 'update' ) {
	gitUpdater.run(function(){
		npmUpdater.run();
	});
} else {
	console.log('Unknown cmd: '+cmd);
}