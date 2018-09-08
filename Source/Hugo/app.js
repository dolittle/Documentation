const path = require('path');
const express = require('express');
const simpleGit = require('simple-git');
const repositories = require('./repositories');
const helpers = require('./helpers');

const app = express();

app.use(express.static('public'));

app.post('/updateRepository', (request, response) => {
    let incomingRepo = request.query.url || '';

    for( var repository in repositories ) {
        if( repository == incomingRepo ) {
            let repositoryPath = path.join(process.cwd(), 'repositories', repositories[repository].name);
            let git = simpleGit(repositoryPath);
            git.pull();

            helpers.run('hugo');
            response.send('Pulled and generated new pages');
            break;
        }
    }
    response.statusCode = 500;
    if( !incomingRepo ) response.send(`You have to provide a query string parameter called 'url' with the GitHub clone url for the repo`);
    else response.send(`Repository ${incomingRepo} is not allowed`);
});

app.listen(3000, () => console.log('Running on port 3000'));
