const fs = require("fs")

const filePath = join(__dirname, "numbers.txt")
const data = fs.readFileSync("numbers-2.txt").trim().split("\n")

console.log('data:', data)