const collectionPath = process.argv[2]
const globalsPath = process.argv[3]
const path = require('path');
const collectionAbsPath = path.resolve(collectionPath);
const collection = require(collectionAbsPath)

const globalsAbsPath = path.resolve(globalsPath);
const globals = require(globalsAbsPath)

const makeDirectory = require('./util').makeDirectory
const createVariableFile = require('./util').createVariableFile
const createRequestFile = require('./util').createRequestFile
const createGlobalsFile = require('./util').createGlobalsFile
const createTests = require('./generator').createTests

const rootDir = 'tests'
makeDirectory(rootDir)

const collectionDir = `${rootDir}/${collection.info.name}`
makeDirectory(collectionDir)
createVariableFile(rootDir)
createRequestFile(rootDir)
createGlobalsFile(rootDir, globals)


collection.item.forEach((item, index) => {
    const currentDirectory = `${collectionDir}/${++index}. ${item.name}`
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