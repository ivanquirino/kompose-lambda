const compose = require('koa-compose')
const debug = require('debug')('quirino:application')
const createContext = require('./create-context')
const onError = require('./on-error')

class Application {
  constructor () {
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

    const handler = (event, context, callback) => {
      const ctx = createContext(event, context, callback)

      fn(ctx).catch(onError)
    }

    return handler
  }
}

module.exports = Application
