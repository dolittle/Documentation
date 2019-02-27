const allowedRepositories = loadRepositoriesConfiguration();
const versioning = require('./versioning');

module.exports = {
    allowedRepositories: allowedRepositories,
    buildVersion: versioning.getVersionFromGit(),
    paths: {
        repositories:'repositories',
        content:'content'
    }
};

function loadRepositoriesConfiguration() {
    let repositories;
    try {
        if (process.env.NODE_ENV && process.env.NODE_ENV == 'development') {
            repositories = require('./repositories.local.json');
            console.log('using repositories from repositories.local.json');
        } else 
        {
            repositories = require('./repositories.json');
            console.log('using repositories from repositories.json');
        }
    } catch (e) {
        repositories = require('./repositories.json');
        console.log('using repositories from repositories.json');
    }

    return repositories;
}