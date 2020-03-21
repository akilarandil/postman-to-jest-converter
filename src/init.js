const filePath = process.argv[2]
const path = require('path');
const collectionAbsPath = path.resolve(filePath);
const collection = require(collectionAbsPath)

const makeDirectory = require('./util').makeDirectory
const createVariableFile = require('./util').createVariableFile
const createTests = require('./generator').createTests


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