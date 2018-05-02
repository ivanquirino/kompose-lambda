const compose = require('koa-compose')
const isJSON = require('koa-is-json')
const createError = require('http-errors')
const debug = require('debug')('quirino:application')

class Application {
  constructor () {
    this.middleware = []
    this.env = process.env.NODE_ENV || 'development'

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

  compose () {
    return compose(this.middleware)
  }

  createContext () {
    return Object.assign({}, this.context)
  }

  respond (ctx, callback) {
    if (!ctx.result.statusCode && !ctx.result.body) {
      const error = createError(404)

      ctx.result.statusCode = error.status

      ctx.result.body = JSON.stringify({
        error: error.name,
        message: error.message
      })
    }

    if (!ctx.result.statusCode && ctx.result.body) {
      if (isJSON(ctx.result.body)) {
        ctx.result.statusCode = 200
        ctx.result.body = JSON.stringify(ctx.result.body)
      }
    }

    callback(null, ctx.result)
  }

  error (err, callback) {
    callback(err)
  }

  getHandler () {
    const fn = this.compose()

    const handler = (event, context, callback) => {
      const ctx = this.createContext()

      ctx.event = event
      ctx.context = context

      fn(ctx)
        .then(() => this.respond(ctx, callback))
        .catch(err => this.error(err, callback))
    }

    return handler
  }
}

module.exports = Application
