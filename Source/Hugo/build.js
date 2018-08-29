#!/usr/local/bin/node
const { spawn } = require('child_process');
const allowedRepositories = require('./repositories.json');
let repositoryUrl = "";
let repositoryConfiguration = {};

function hasClone() {
    return false;
}

function clone() {

}

function createSymbolicLink() {

}

function pullChanges() {

}

function run(program, args) {
    let process = spawn(program, args);

    process.stdout.on('data', (data) => {
        console.log(`${data}`);
    });

    process.stderr.on('data', (data) => {
        console.log(`${data}`);
    });

    process.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

    return process;
}

if (process.argv.length != 3) {
    console.log('You need to provide a repository url');
    process.exit();
}

repositoryUrl = process.argv[2];
if (!allowedRepositories.hasOwnProperty(repositoryUrl)) {
    console.log('You have to provide an allowed repository');
    process.exit();
}

repositoryConfiguration = allowedRepositories[repositoryUrl];

console.log(`Build documentation based on changes from ${repositoryUrl}`);

if (!hasClone()) {
    clone();
    createSymbolicLink();
} else {
    pullChanges();
}

run('hugo');





