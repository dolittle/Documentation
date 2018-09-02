const { spawnSync } = require('child_process');
const fs = require('fs');

module.exports = {
    deleteFolderRecursive: function (path) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file, index) {
                var curPath = `${path}/${file}`;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    },

    run: function (program, args, workingDir) {
        let result = spawnSync(program, args, {
            cwd: workingDir,
            stdio: [null, process.stdout, process.stderr]
        });

        if (result.stdout) console.log(`${result.stdout}`);

        return result;
    }
};