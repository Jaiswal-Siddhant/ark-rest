const path = require('path');
const fs = require('fs');

async function init(sourceDir, targetDir) {
    try {
        if (!fs.existsSync(path.resolve(targetDir))) {
            console.log(path.resolve(targetDir));
            fs.mkdirSync(path.resolve(targetDir));
        }

        if (fs.existsSync(path.join(targetDir + '/ark.config.yaml'))) {
            throw new Error('Config file ark.config.yaml already exists');
        }

        const files = fs.readdirSync(sourceDir);

        for (const file of files) {
            const sourceFilePath = path.join(sourceDir, file);
            const targetFilePath = path.join(targetDir, file);

            fs.copyFileSync(sourceFilePath, targetFilePath);
            // console.log(`Copied ${file} to ${targetDir}`);
        }

        console.log('\nSuccessfully initialized ark project!');
        return true;
    } catch (err) {
        console.log();
        console.error('Error: ', err.message);
    }
}

module.exports = init;
