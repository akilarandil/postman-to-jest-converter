const createTestFile = require('./util').createTestFile

function convertStringToTest(string) {
    const testExpression = string.match(/\[(.*?)\]/)[1]

    const assertion = string.match(/]\s*=(.+)/)[1].replace(/;/, '')

    return `assert(${assertion}, ${testExpression})`
}

function generateTestExecutions(execs) {
    if (!execs) return ''
    let testString = ''
    const testRegex = /tests\[.*\]\s*=\s*.*/
    for (let exec of execs) {
        if (testRegex.test(exec)) {
            const convertedTest = convertStringToTest(exec)
            testString = `${testString}\n ${convertedTest}`
        } else {
            testString = `${testString}\n ${exec}`
        }
    }
    return testString
}

const createTestFileContent = (absolutePath, describe, test, requestConfig, allTests, allPreTests) => `const axios = require('axios')
const assert = require('chai').assert
const pm = require('${absolutePath}/pm.js')

describe('${describe}', () => {
    it('${test}',async () => {
        ${allPreTests ? '//Pre Request\n' + allPreTests + '\n' : ''}
        //Tests
        const requestConfig = ${JSON.stringify(requestConfig)}
        const response = await axios.request(requestConfig)
        const responseBody = JSON.stringify(response.data)
        const responseCode = {
            code: response.status
        }
        
        ${allTests ? allTests : ''}
    })
})
`

module.exports = {
    createTests: ({request, event, name}, currentDirectory, absolutePath) => {
        const requestConfig = {
            url: request.url,
            method: request.method,
            data: request.body.raw
        }
        const {script: testScript = {}} = event.find(e => e.listen === 'test') || {}
        const allTests = generateTestExecutions(testScript.exec)
        const {script: preTestScript = {}} = event.find(e => e.listen === 'prerequest') || {}
        const allPreTests = generateTestExecutions(preTestScript.exec)
        const fileContent = createTestFileContent(absolutePath, name, name, requestConfig, allTests, allPreTests)
        createTestFile(name, fileContent, currentDirectory)
    }
}




