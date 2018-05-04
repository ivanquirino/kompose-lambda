const assert = require('assert')

function onError (error) {
  assert(error instanceof Error, `non-error thrown: ${error}`)
  console.error(error.stack || error.toString()) // eslint-disable-line
}

module.exports = onError
