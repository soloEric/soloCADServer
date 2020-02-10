# soloCADServer
Server which automates common processes for CAD team members at SOLO

Need npm installed for node package installation

run npm install to download packages in package.json
run npm test to run http tests of server. Be sure to run server on command line first
ports are hard coded to 8080 and local ip


Node forever package is installed globally on the system.
This will restart what ever process you initialize it with, even if it crashes or you kill it manually

to start a process: 
enter command-- forever start <name_of_file.js>

to find what forever processes are running:
enter command-- forever list

to stop a process:
enter command-- forever stop <name_of_file.js>
