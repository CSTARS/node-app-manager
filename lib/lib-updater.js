/***
 * Download latest versions of Node.js and MongoDB
 ***/
var request = require('request');
var fs = require('fs');
var exec = require('child_process').exec;

// root url's
var nodejsUrl = 'http://nodejs.org/dist/latest/';
// what OS are we downloading for
// linux or darwin
var nodejsPlatform = '';
var nodeVersion = '';

var mongoUrl = 'http://www.mongodb.org/downloads';
// linux or osx
var mongoPlatform = '';
var mongoVersion = '';

// where are we downloading to
var dir = __dirname+'/../../lib';

// current versions
var versions = {};
try {
    versions = require(dir+'/versions.json');
} catch(e) {};


function getLatestNodeVersion(callback) {
    request(nodejsUrl, function (error, request, body) {
        if( !callback ) return;
        var lines = body.split('\n');
        for( var i = 0; i < lines.length; i++ ) {
            if( lines[i].match(/.*node-.*-x64\.tar\.gz.*/) ) {
                callback(lines[i].replace(/.*node-/,'').replace(/-x64\.tar\.gz.*/,'').replace(/-.*\r/,''));
                callback = null;
                return;
            }
        }
    });
}

function getLatestMongoVersion(callback) {
    request(mongoUrl, function (error, request, body) {
        if( !callback ) return;
        var re = new RegExp('http://fastdl.mongodb.org/'+mongoPlatform+'/mongodb-'+mongoPlatform+'-x86_64-\\d+.\\d+.\\d+.tgz');
        var match = body.match(re);

        if( match ) callback(body.match(re).slice(0)[0]);
        else callback('');

        callback = null;
    });
}

function downloadLatestNodeVersion(callback) {
    getLatestNodeVersion(function(version){
        nodeVersion = version+'-'+nodejsPlatform;

        if( versions.node == nodeVersion ) {
            console.log('Node.js is up-to-date: '+nodeVersion);
            return callback(false);
        }

        console.log('Downloading '+nodejsUrl+'node-'+version+'-'+nodejsPlatform+'-x64.tar.gz ...');
        request(nodejsUrl+'node-'+version+'-'+nodejsPlatform+'-x64.tar.gz', function(){
            console.log('Complete.\n');
            if( callback ) callback(true);
            callback = null;
        }).pipe(fs.createWriteStream(dir+'/nodejs.tar.gz'));
    });
}

function downloadLatestMongoVersion(callback) {
    getLatestMongoVersion(function(url){
        var parts = url.split('-');
        var version = parts[parts.length-1].replace(/\.tgz/,'');

        mongoVersion = 'v'+version+'-'+mongoPlatform;

        if( versions.mongo == mongoVersion ) {
            console.log('MongoDB is up-to-date: '+mongoVersion);
            return callback(false);
        }

        console.log('Downloading '+url+' ...');
        request(url, function(){
            console.log('Complete.\n');
            if( callback ) callback(true);
            callback = null;
        }).pipe(fs.createWriteStream(dir+'/mongodb.tgz'));
    });
}

function updateNodeJs(callback) {
    downloadLatestNodeVersion(function(updated){
        if( !updated ) return callback();

        // remove current folder
        if( fs.existsSync(dir+'/nodejs') ) {
            rmdir(dir+'/nodejs');
        };

        // unzip node package and remove zip
        console.log('Unpacking nodejs library ...');


        exec('cd '+dir+'; tar -xzf nodejs.tar.gz; mv `ls | grep node-v` nodejs; rm nodejs.tar.gz',
          function (error, stdout, stderr) {
            if( stdout && stdout.length > 0 ) console.log(stdout);
            if( stderr && stderr.length > 0 ) console.log(stderr);

            console.log('Complete.\n');

            versions.node = nodeVersion;
            fs.writeFileSync(dir+'/versions.json', JSON.stringify(versions));

            if( callback ) callback();
        });
    });
}

function updateMongoDB() {
    downloadLatestMongoVersion(function(updated){
        if( !updated ) return;

        // remove current folder
        if( fs.existsSync(dir+'/mongo') ) {
            rmdir(dir+'/mongo');
        };

        // unzip node package and remove zip
        console.log('Unpacking mongo library ...');


        exec('cd '+dir+'; gunzip mongodb.tgz; tar -xf mongodb.tar; mv `ls | grep mongodb-` mongodb; rm -rf mongodb.tar',
          function (error, stdout, stderr) {
            if( stdout && stdout.length > 0 ) console.log(stdout);
            if( stderr && stderr.length > 0 ) console.log(stderr);

            console.log('Complete.\n');

            versions.mongo = mongoVersion;
            fs.writeFileSync(dir+'/versions.json', JSON.stringify(versions));
        });
    });
}

exports.run = function() {
    // create the lib dir if it does not exist
    if( !fs.existsSync(dir) ) {
        fs.mkdirSync(dir);
    } else {
        // see if there
    }
    
    getPlatform(function(){
        updateNodeJs(function(){
            updateMongoDB();
        });
    });
    
}

function getPlatform(callback) {
    exec('uname',
      function (error, stdout, stderr) {
        if( stderr && stderr.length > 0 ) console.log(stderr);
        var uname = stdout.toLowerCase().replace(/\n/g,'');

        nodejsPlatform = uname;
        mongoPlatform = uname;
        if( uname == 'darwin' ) {
            mongoPlatform = 'osx';
        } else if ( uname != 'linux' ) {
            console.log('System not supported');
            process.kill();
        }

        if( callback ) callback();
    });
}

function rmdir(dir, callback) {
    exec('rm -rf '+dir,function(err,out) { 
        if( callback ) callback();
    });
}
