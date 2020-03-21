const fs = require('fs');
const beautify = require('js-beautify').js

let createdFileTotal = 0

function createFile(fileWithDir, content) {
    const beautifiedData = beautify(content, {indent_size: 2, space_in_empty_paren: true})
    fs.writeFile(`${fileWithDir}`, beautifiedData, function (err) {
        if (err) {
            return console.log(err);
        }
        createdFileTotal += 1
        console.log(`${createdFileTotal} - ${fileWithDir} saved`);
    });
}

module.exports = {
    totalFilesCreated: () => {
        return getTotalFilesCreated()
    },
    makeDirectory: (dir) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    },
    createTestFile: (name, content, currentDirectory) => {
        createFile(`${currentDirectory}/${name}.spec.js`, content)
    },

    createVariableFile: (rootdir) => {
        const content = `const state = {}
module.exports = {
    environment: {
        set: (key, value) => {
            state[key] = value
        },
        get: (key) => state[key],
        unset: (key) => {
          delete state[key]
        }
    }
}`
        createFile(`${rootdir}/pm.js`, content)
    }
}