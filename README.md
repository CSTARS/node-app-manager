node-app-manager
================

Manage Node.js, MongoDB and github repo's for a node project.

Usage:

Create project folder, clone repo, cd to folder and run initialization script.
```
  mkdir my-project
  cd my-project
  git clone https://github.com/CSTARS/node-app-manager.git
  cd node-app-manager
  ./init.sh
```

You will now have a folder my-project/lib with the latest versions of Node.js and MongoDB

To keep things up-to-date run:
```
  cd node-app-manager
  ./update.sh
```
