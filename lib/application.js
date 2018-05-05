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

  use (fn) {
    if (typeof fn !== 'function') {
      throw TypeError('middleware must be a function!')
    }

    debug('use %s', fn._name || fn.name || '-')
    this.middleware.push(fn)
    return this
  }

  getHandler () {
    const fn = compose(this.middleware)
    const createContext = this.opts.createContext || deafultCreateContext
    const onError = this.opts.handleError || defaultOnError
    const afterChain = this.opts.afterChain

    const handler = (event, context, callback) => {
      const ctx = createContext(event, context, callback)

      return fn(ctx).then(() => {
        if (afterChain) afterChain(event, context, callback)
      }).catch(err => {
        onError(err, event, context, callback)
      })
    }

    return handler
  }
}

module.exports = Application
