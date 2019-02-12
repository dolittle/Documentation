#!/usr/local/bin/node
const helpers = require('./helpers');
const globals = require('./globals');
const fs = require('fs');
let repositoryUrl = "";
let repositoryConfiguration = {};
let repositoryPath = "";
// https://dolittle.blob.core.windows.net/documentation


function hasClone() {
    let path = `${globals.paths.repositories}/${repositoryConfiguration.name}`;
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

function createSymbolicLink() {
    let relativeLinkTargetPathPart = getRelativePathPart(repositoryConfiguration.path)
    let linkTarget = `${relativeLinkTargetPathPart}${repositoryPath}/Documentation`;
    let linkSource = `${globals.paths.content}/${repositoryConfiguration.path}/${repositoryConfiguration.name}`;

    console.log(`Creating symlink for ${linkSource} to ${linkTarget}`);
    if( fs.existsSync(linkSource)) {
        console.log(`Unlinking symlink for ${linkSource}`);
        fs.unlinkSync(linkSource);
    }
    console.log(`Creating symlink for ${linkSource}`);
    fs.symlinkSync(linkTarget, linkSource, 'dir');
}

function getRelativePathPart(path) {
    let relativePathPart = '../';
    return path ? relativePathPart + path.split('/').map(() => '../').join() : relativePathPart;
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
    if (!hasClone()) {
        console.log('Clone');
        clone();
    } else {
        pullChanges();
    }
 
    createSymbolicLink();   
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