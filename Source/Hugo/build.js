#!/usr/local/bin/node
const helpers = require('./helpers');
const globals = require('./globals');
const fs = require('fs');
let repositoryUrl = "";
let repositoryConfiguration = {};
let repositoryPath = "";
// https://dolittle.blob.core.windows.net/documentation


function hasClone() {
    let path = repositoryPath;
    if( fs.existsSync(path) ) {
        let gitPath = `${path}/.git`;
        if( fs.existsSync(gitPath)) return true;
        helpers.deleteFolderRecursive(path);
    }

    return false;
}

function clone() {
    console.log(`Cloning ${repositoryUrl} into ${repositoryConfiguration.name} in working dir repositories`);
    helpers.run('git', [
        'clone',
        '--recurse-submodules',
        repositoryUrl,
        repositoryConfiguration.name
    ], 'repositories');
}

function createSymbolicLink(target) {
    console.log(`Creating symlink for ${target}`);
    try {
        let linkTarget = fs.realpathSync(`${target}/Documentation`);
        let linkSource = `${globals.paths.content}/${repositoryConfiguration.path}/${repositoryConfiguration.name}`;

        if( fs.existsSync(linkSource)) {
            console.log(`Unlinking symlink for ${linkSource}`);
            fs.unlinkSync(linkSource);
        }
        if( fs.existsSync(linkTarget)) {
            fs.symlinkSync(linkTarget, linkSource, 'dir');
            console.log(`Created symlink for ${linkSource} to ${linkTarget}`);    
        }
        else {
            console.log(`Skipping symlink for ${linkSource}. Could not find target ${linkTarget}`);
        }
    } catch (e) {
    console.log(`Could not create symlink for ${target}`, e);

    }
}

function pullChanges() {
    helpers.run('git', [
        'reset',
        '--hard'
    ], repositoryPath);

    helpers.run('git', [
        'pull'
    ], repositoryPath);
}

function upload() {
    // Upload to Azure Blob Storage
}

function handleCurrentRepository() {
    const isLocalRepository = fs.existsSync(repositoryUrl);
    if(isLocalRepository){
        createSymbolicLink(repositoryUrl);           
    }
    else{
        if (!hasClone()) {
            console.log('Clone');
            clone();
        } else {
            pullChanges();
        }
        createSymbolicLink(repositoryPath);   
    }
 
}

if( process.argv.length == 2 ) {
    for( var property in globals.allowedRepositories ) {
        repositoryConfiguration = globals.allowedRepositories[property];
        console.log(`Handling repository : ${repositoryConfiguration.name} - ${property}`)
        repositoryUrl = property;
        repositoryPath = `${globals.paths.repositories}/${repositoryConfiguration.name}`;
    
        handleCurrentRepository();
    }
} else {
    if (process.argv.length != 3) {
        console.log('You need to provide a repository url');
        process.exit();
    }

    repositoryUrl = process.argv[2];
    if (!globals.allowedRepositories.hasOwnProperty(repositoryUrl)) {
        console.log('You have to provide an allowed repository');
        process.exit();
    }

    repositoryConfiguration = globals.allowedRepositories[repositoryUrl];
    repositoryPath = `${globals.paths.repositories}/${repositoryConfiguration.name}`;

    console.log(`Build documentation based on changes from ${repositoryUrl}`);

    handleCurrentRepository();
}

helpers.run('hugo');
upload();