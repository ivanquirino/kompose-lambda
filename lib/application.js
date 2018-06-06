const compose = require('koa-compose')
const debug = require('debug')('kompose-lambda')
const deafultCreateContext = require('./create-context')
const defaultOnError = require('./on-error')
const validateOptions = require('./validate-options')

class Application {
  constructor (opts = {}) {
    if (!validateOptions(opts)) {
      throw new TypeError(`Invalid Options: ${JSON.stringify(opts)}`)
    }

    this.opts = opts
    this.middleware = []
  }

  /**
   * Insert a middleware function in the chain
   * @param {function} fn a function: (ctx [,next]) => {}
   */
  use (fn) {
    if (typeof fn !== 'function') {
      throw TypeError('Middleware must be a function!')
    }

    debug('use %s', fn._name || fn.name || '-')
    this.middleware.push(fn)
    return this
  }

  /**
   * Insert the final handler to run after all middleware
   * Useful to create a default response handler
   * @param {context} fn a function: ctx => {}
   */
  final (fn) {
    throwNotFunction(fn, 'Final handler must be a function!')

    debug('final %s', fn._name || fn.name || '-')
    this.finalHandler = fn
    return this
  }

  /**
   * Register a custom error handler
   * @param {function} fn a function with (err, ctx) arguments
   */
  error (fn) {
    throwNotFunction(fn, 'Error handler must be a function! ')

    debug('error %s', fn._name || fn.name || '-')
    this.errorHandler = fn
    return this
  }

  /**
   * Returns a handler like (event, context, callback)
   * @returns {function} (event, context, callback)
   */
  getHandler () {
    const fn = compose(this.middleware)
    const createContext = this.opts.createContext || deafultCreateContext
    const onError = this.errorHandler || defaultOnError

    const handler = (event, context, callback) => {
      const ctx = createContext(event, context, callback)

      return fn(ctx).then(() => {
        if (this.finalHandler) return this.finalHandler(ctx)
      }).catch(err => {
        return onError(err, ctx)
      })
    }

    return handler
  }
}

function throwNotFunction (fn, message) {
  if (typeof fn !== 'function') {
    throw TypeError(message)
  }
}

module.exports = Application
