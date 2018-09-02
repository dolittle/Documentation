const { spawnSync } = require('child_process');
const stream = require('stream');
const BuildVersion = require('./BuildVersion');

module.exports = {
    getVersionFromGit: function () {
        let captureStream = new stream();
        let result = spawnSync(
            'git', [
                'tag',
                '--sort=-version:refname'
            ], {
                cwd: '.'
            }
        );

        let versions = [];
        let lines = result.output.toString().split('\n');
        lines.forEach(line => 
        {
            if( line.indexOf(',') == 0 ) line = line.substr(1);
            line = line.trim();
            if( line.length > 0 ) versions.push(line);
        });

        if( versions.length > 0 ) return new BuildVersion(versions[0]);
        else return new BuildVersion("1.0.0");
    }
}

