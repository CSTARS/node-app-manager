loc=$(pwd)
url="http://nodejs.org/dist/latest/"
dir="../lib"

# see if versions file already exists, if so, probably don't want to run this
if [  -f "$dir/versions.json" ]; then
	echo "$dir/versions.json already exists, this library as already been initialized."
	exit
fi

# find os we are working on
platform=$(uname | awk '{print tolower($0)}'); 

# find the lastest version number so we know what file to download
file=`curl $url | grep ".*node-.*-$platform-x64\.tar\.gz.*" | awk '{gsub("<[^>]*>", "")}1' | awk '{sub(/[ \t]+.*$/, "")}1'`;
# grab latest node
wget "$url$file"

# create the lib directory
if [ ! -d "$dir" ]; then
	mkdir $dir
fi

# copy over nodejs tar
mv $file $dir
cd $dir
tar -xzf $file

# mv to std folder name and clean up
folder=$(echo $file | awk '{sub(".tar.gz", "")}1');
rm -rf nodejs
mv $folder nodejs
rm -rf $file

# write versions.json file so node script know current version we are running
version=$(echo $folder | awk '{sub("node-", "")}1' | awk '{sub("-x64", "")}1')
echo "{\"node\":\"$version\"}" > versions.json

# now use the node script to install mongo
cd $loc
$dir/nodejs/bin/npm install
$dir/nodejs/bin/node index.js update-lib

echo "Success! Node.js and MongoDB have been installed in $dir"
echo "Use '../lib/nodejs/bin/node index.js update-lib' or 'update.sh' to keep libraries up-to-date";