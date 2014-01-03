var fs = require('fs');
var async = require('async');
var dir = __dirname+'/../..';
var npm = 'lib/nodejs/bin/npm';
var exec = require('child_process').exec;

var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

exports.run = function() {
  walk(dir, function(err, results) {
    if (err) throw err;

    var packages = [];

    for( var i = 0; i < results.length; i++ ) {

        if( results[i].match(/.*package\.json/) && !results[i].match(/.*node_module.*/) ) {
            packages.push(results[i]);
        }
    }
    
    updatePackages(packages);
  });
}

function updatePackages(packages) {
    async.eachSeries(packages,
        function(pkg, next) {
            var parts = pkg.split('/../..');
            var dirCount = parts[1].split('/').length-2;

            var npmLoc = '';
            for( var i = 0; i < dirCount; i++ ) npmLoc += '../'
            npmLoc += npm;

            pkg = pkg.split('/');
            pkg.splice(pkg.length-1, 1);

            console.log('Updating '+pkg.join('/').split('/../..')[1]+'/package.json ...');
            exec('cd '+pkg.join('/')+'; '+npmLoc+' install',
                function (error, stdout, stderr) {
                    console.log(stdout);
                    if( error ) console.log(error);
                    if( stderr ) console.log(stderr);
                    next();
                }
            );
        },
        function(err){
            console.log('done.');
        }
    );
}