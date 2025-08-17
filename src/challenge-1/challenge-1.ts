import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const numbersFilePath = join(__dirname, './numbers.txt')
const numbers2FilePath = join(__dirname, './numbers-2.txt')
const totalDiffFilePath = join(__dirname, './totalDiff.txt')
const similarityScoreFilePath = join(__dirname, './similarityScore.txt')

function processDataToColumns(filePath: string) {
  const col1: number[] = []
  const col2: number[] = []

  const rows = readFileSync(filePath, 'utf-8')
    .split('\n')
    .map((line) => {
      // TODO: update to split into multiple columns instead of just two
      const [first, second] = line.split('   ')

      // TODO: check if each value contains only numberical digits
      return [Number(first), Number(second)]
    })

  rows.forEach((row) => {
    // check that both columns have values
    if (row[0] && row[1]) {
      col1.push(row[0])
      col2.push(row[1])
    }
  })

  // TODO: change to array of arrays
  return { col1, col2 }
}

// TODO: change parameter to array of arrays
function processColsToSortedPairs({
  col1,
  col2,
}: {
  col1: number[]
  col2: number[]
}) {
  const pairs: Array<number[]> = []

  // TODO: check length of each column to make sure it's processed correctly
  // sort the columns
  col1.sort((a, b) => a - b)
  col2.sort((a, b) => a - b)

  // after the columns are sorted, pair the values from each column in the final array
  col1.forEach((val, index) => {
    if (col1[index] && col2[index]) {
      pairs.push([val, col2[index]])
    }
  })

  return pairs
}

function calcTotalDiff(pairs: Array<number[]>) {
  const val = pairs.reduce((acc, curr: Array<number>) => {
    if (
      !Array.isArray(curr) ||
      curr.length !== 2 ||
      typeof curr[0] !== 'number' ||
      typeof curr[1] !== 'number' ||
      isNaN(curr[0]) ||
      isNaN(curr[1])
    ) {
      return acc
    }

    return acc + (Math.max(...curr) - Math.min(...curr))
  }, 0)
  return val
}

function writeValueToFile(filePath: string, val: number) {
  writeFileSync(filePath, val.toString())
  console.log(`The file has been saved with the number ${val}!`)
}

function findSimilarityScore({
  col1,
  col2,
}: {
  col1: number[]
  col2: number[]
}) {
  let similarityScore = 0
  const similarityCountByVal: Record<number, number> = {}
  for (let i = 0; i < col1.length; i++) {
    const currCol1Val = col1[i]
    // if the current value already has a similarity count, avoid looping again and add it to the score
    if (currCol1Val && similarityCountByVal[currCol1Val]) {
      similarityScore += similarityCountByVal[currCol1Val]
    } else {
      // loop thru all of col2 and create a similarity count for the current value in col1
      for (let j = 0; j < col2.length; j++) {
        const currCol2Val = col2[j]

        if (currCol2Val && currCol1Val === currCol2Val) {
          // if the value is already in the object, increment the count
          if (similarityCountByVal[currCol2Val]) {
            similarityCountByVal[currCol2Val] += currCol2Val
          } else {
            // if value is not in the object, add it and set the count to 1
            similarityCountByVal[currCol2Val] = currCol2Val
          }

          similarityScore += currCol2Val
        }
      }
    }
  }

  return similarityScore
}

const totalDiff = calcTotalDiff(
  processColsToSortedPairs(processDataToColumns(numbersFilePath)),
)
writeValueToFile(totalDiffFilePath, totalDiff)

const similarityScore = findSimilarityScore(
  processDataToColumns(numbersFilePath),
)
writeValueToFile(similarityScoreFilePath, similarityScore)
