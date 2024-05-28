const fs = require("fs/promises")

exports.selectApi = () => {
    return fs.readFile("endpoint.json", "utf-8").then((contents) => {
        return contents
    })
}