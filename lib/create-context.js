function createContext (event = {}, context = {}, callback = () => {}) {
  const defaultContext = {
    event: {},
    context: {},
    callback: () => {},
    result: {
      statusCode: null,
      body: '',
      headers: {},
      isBase64Encoded: false
    },
    customContext: {}
  }

  const ctx = Object.assign({}, defaultContext)

  ctx.event = event
  ctx.context = context
  ctx.callback = callback

  return ctx
}

module.exports = createContext
