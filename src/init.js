const fs = require('fs');
const beautify = require('js-beautify').js
const filePath = process.argv[2]
const path = require('path');
const collectionAbsPath = path.resolve(filePath);
const collection = require(collectionAbsPath)

function createVariableFile(rootdir) {
    const content = `const state = {}
module.exports = {
    environment: {
        set: (key, value) => {
            state[key] = value
        },
        get: (key) => state[key]
    }
}`
    fs.writeFile(`${rootdir}/pm.js`, content, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

const createTestFileContent = (absolutePath, describe, test, requestConfig, allTests) => `const axios = require('axios')
const assert = require('chai').assert
const pm = require('${absolutePath}/pm.js')

describe('${describe}', () => {
    it('${test} ....',async () => {
        const requestConfig = ${JSON.stringify(requestConfig)}
        const response = await axios.request(requestConfig)
        const responseBody = JSON.stringify(response.data)
        const responseCode = {
            code: response.status
        }
        ${allTests}
    })
})
`

makeDirectory('tests')
const rootDir = `tests/${collection.info.name}`
makeDirectory(rootDir)
createVariableFile(rootDir)
collection.item.forEach((item, index) => {
    const currentDirectory = `${rootDir}/${++index}. ${item.name}`
    makeDirectory(currentDirectory)
    const absolutePath = path.resolve(rootDir);
    execute(item.item, currentDirectory, absolutePath)
})

function execute(items, currentDirectory, absolutePath) {
    items.forEach((item, index) => {
        if (item._postman_isSubFolder) {
            const newDir = `${currentDirectory}/${++index}. ${item.name}`
            makeDirectory(newDir)
            execute(item.item, newDir, absolutePath)
        } else {
            createTests(item, currentDirectory, absolutePath)
        }
    })
}

function createTests({request, event, name}, currentDirectory, absolutePath) {
    const requestConfig = {
        url: request.url,
        method: request.method,
        data: request.body.raw
    }
    const {script = {}} = event.find(e => e.listen === 'test') || {}
    const allTests = createTest(script.exec)
    const fileContent = createTestFileContent(absolutePath, 'some', 'test', requestConfig, allTests)
    createTestFile(name, fileContent, currentDirectory)
}

function createTest(execs) {
    if (!execs) return ''
    let testString = ''
    const testRegex = /tests\[.*\]\s*=\s*.*/g
    for (let exec of execs) {
        if (testRegex.test(exec)) {
            const convertedTest = convert(exec)
            testString = `${testString}\n ${convertedTest}`
        } else {
            testString = `${testString}\n ${exec}`
        }
    }
    return testString
}

function convert(string) {
    const testExpression = string.match(/\[(.*?)\]/)[1]

    const assertion = string.match(/=(.+)/)[1]

    return `assert(${assertion}, ${testExpression})`
}

function createTestFile(name, content, currentDirectory) {
    const beautifiedData = beautify(content, {indent_size: 2, space_in_empty_paren: true})
    fs.writeFile(`${currentDirectory}/${name}.spec.js`, beautifiedData, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}


function makeDirectory(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}