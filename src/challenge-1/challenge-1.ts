import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ACTUAL DATA
const numbersFilePath = join(__dirname, './numbers.txt')
// TEST DATA
const numbers2FilePath = join(__dirname, './numbers-2.txt')

// OUTPUT FILES
const totalDiffFilePath = join(__dirname, './totalDiff.txt')
const similarityScoreFilePath = join(__dirname, './similarityScore.txt')

/**
 * process two columns of text data into two arrays of numbers
 * @param filePath - path for text file containing data
 * @returns {col1, col2} - two arrays of numbers
 */
function processDataToColumns(filePath: string) {
  const col1: number[] = []
  const col2: number[] = []

  const rows = readFileSync(filePath, 'utf-8')
    .split('\n')
    .map((line) => {
      // OPTIMIZE: update to split into multiple columns instead of just two
      const [first, second] = line.split('   ')

      // OPTIMIZE: check if each value contains only numberical digits
      return [Number(first), Number(second)]
    })

  rows.forEach((row) => {
    // check that both columns have values
    if (row[0] && row[1]) {
      col1.push(row[0])
      col2.push(row[1])
    }
  })

  // OPTIMIZE: change to array of arrays
  return { col1, col2 }
}

/**
 * sort columns (two arrays of numbers) from smallest to largest and pair the values at each index
 * @param {col1, col2} - two arrays of numbers
 * @returns {pairs} - array of pairs of numbers
 */
// OPTIMIZE: change parameter to array of arrays
function processColsToSortedPairs({
  col1,
  col2,
}: {
  col1: number[]
  col2: number[]
}) {
  const pairs: Array<number[]> = []

  // OPTIMIZE: check length of each column to see if each col has complete data
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

/**
 * find the sum of the difference between each pair of numbers
 * @param {pairs} - array of pairs of numbers
 * @returns {val} - total difference
 */
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

/**
 * print value to output file
 * @param {filePath} - path for output file
 * @param {val} - value to write to file
 * @returns {void}
 */
function writeValueToFile(filePath: string, val: number) {
  writeFileSync(filePath, val.toString())
  console.log(`The file has been saved with the number ${val}!`)
}

/**
 * Find total similarity score for two columns of numbers
 * Find the similarity score for each value in col1 by checking how many times it appears in col2
 * ex: 3 appears 3 times for a score of 9 (3+3+3)
 * @param {col1, col2} - two arrays of numbers
 * @returns {similarityScore} - total similarity score
 */
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
