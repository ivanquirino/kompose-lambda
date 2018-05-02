const compose = require('koa-compose')
const debug = require('debug')('quirino:application')

class Application {
  constructor () {
    this.middleware = []

    this.context = {
      event: null,
      context: null,
      result: {
        statusCode: null,
        body: '',
        headers: {},
        isBase64Encoded: false
      },
      userContext: {}
    }
  }

  use (fn) {
    if (typeof fn !== 'function') {
      throw TypeError('middleware must be a function!')
    }

    debug('use %s', fn._name || fn.name || '-')
    this.middleware.push(fn)
    return this
  }

  getComposed () {
    return compose(this.middleware)
  }

  createContext (event, context, callback) {
    const ctx = Object.assign({}, this.context)

    ctx.event = event
    ctx.context = context
    ctx.callback = callback

    return ctx
  }

  getHandler () {
    const fn = this.getComposed()

    const handler = (event, context, callback) => {
      const ctx = this.createContext(event, context, callback)

      fn(ctx).catch(err => callback(err))
    }

    return handler
  }
}

module.exports = Application
