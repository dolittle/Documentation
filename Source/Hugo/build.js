#!/usr/local/bin/node
const { spawnSync } = require('child_process');
const fs = require('fs');
const allowedRepositories = require('./repositories.json');
let repositoryUrl = "";
let repositoryConfiguration = {};
let repositoryPath = "";
// https://dolittle.blob.core.windows.net/documentation

function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function(file, index){
        var curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  };

function run(program, args, workingDir) {
    let result = spawnSync(program, args, {
        cwd: workingDir,
        stdio: [null, process.stdout, process.stderr ]
    });

    if( result.stdout ) console.log(`${result.stdout}`);

    return result;
}


function hasClone() {
    let path = `repositories/${repositoryConfiguration.name}`;
    if( fs.existsSync(path) ) {
        let gitPath = `${path}/.git`;
        if( fs.existsSync(gitPath)) return true;
        deleteFolderRecursive(path);
    }

    return false;
}

function clone() {
    console.log(`Cloning ${repositoryUrl} into ${repositoryConfiguration.name} in working dir repositories`);
    run('git', [
        'clone',
        '--recurse-submodules',
        repositoryUrl,
        repositoryConfiguration.name
    ], 'repositories');
}

function createSymbolicLink() {
    let linkTarget = `../${repositoryPath}/Documentation`;
    let linkSource = `content/${repositoryConfiguration.name}`;

    console.log(`Creating symlink for ${linkSource} to ${linkTarget}`);
    if( fs.existsSync(linkSource)) {
        console.log(`Unlinking symlink for ${linkSource}`);
        fs.unlinkSync(linkSource);
    }
    console.log(`Creating symlink for ${linkSource}`);
    fs.symlinkSync(linkTarget, linkSource, 'dir');
}

function pullChanges() {
    run('git', [
        'reset',
        '--hard'
    ], repositoryPath);

    run('git', [
        'pull'
    ], repositoryPath);
}

function upload() {
    // Upload to Azure Blob Storage
}

function handleCurrentRepository() {
    if (!hasClone()) {
        console.log('Clone');
        clone();
    } else {
        pullChanges();
    }
    
    createSymbolicLink();   
}

if( process.argv.length == 2 ) {
    for( var property in allowedRepositories ) {
        repositoryConfiguration = allowedRepositories[property];
        console.log(`Handling repository : ${repositoryConfiguration.name} - ${property}`)
        repositoryUrl = property;
        repositoryPath = `repositories/${repositoryConfiguration.name}`;
    
        handleCurrentRepository();
    }
} else {
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
    repositoryPath = `repositories/${repositoryConfiguration.name}`;

    console.log(`Build documentation based on changes from ${repositoryUrl}`);

    handleCurrentRepository();
}

run('hugo');
upload();