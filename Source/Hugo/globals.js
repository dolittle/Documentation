const allowedRepositories = require('./repositories.json');
const versioning = require('./versioning');

module.exports = {
    allowedRepositories: allowedRepositories,
    buildVersion: versioning.getVersionFromGit(),
    paths: {
        repositories:'repositories',
        content:'content'
    }
};