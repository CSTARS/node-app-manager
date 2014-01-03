var fs = require('fs');
var async = require('async');
var exec = require('child_process').exec;

var dir = __dirname+"/../../";
var onComplete = null;

exports.run = function(callback) {
	onComplete = callback;
	var repos = [];

	// list all
	var files = fs.readdirSync(dir);
	for( var i = 0; i < files.length; i++ ) {
		var stat = fs.statSync(dir+files[i]);
		if( stat.isDirectory() ) {
			var dirFiles = fs.readdirSync(dir+files[i]);
			for( var j = 0; j < dirFiles.length; j++ ) {
				if( dirFiles[j] == '.git' ) repos.push(files[i]);
			}
		}
	}

	updateRepos(repos);
}

function updateRepos(repos) {
	async.eachSeries(repos,
		function(repo, next) {
			console.log('Updating '+repo+' ...');
			exec('cd '+dir+repo+'; git pull',
	          	function (error, stdout, stderr) {
	          		console.log(stdout);
	          		if( stderr ) console.log(stderr);
	          		next();
	        	}
	        );
		},
		function(err){
			console.log('done.');
			if( onComplete ) onComplete();
		}
	);
}