function validateOptions (opts) {
  if (!opts) return true

  const params = ['handleError', 'createContext', 'afterChain']

  return params.every(value => opts[value] === undefined ||
    typeof opts[value] === 'function')
}

module.exports = validateOptions
