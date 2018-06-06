const KomposeLambda = require('../lib/application')

test('application/json response usage example', done => {
  const event = {}
  const context = {}

  const app = new KomposeLambda()

  app.use((ctx, next) => {
    ctx.result.headers['access-control-allow-origin'] = '*'
    next()
  })

  app.use((ctx) => {
    ctx.result.statusCode = 200
    ctx.result.body = {test: 'first', second: 'yo'}
    ctx.result.body = JSON.stringify(ctx.result.body)

    ctx.callback(null, ctx.result)
  })

  const handler = app.getHandler()

  const callback = (theError, result) => {
    expect(typeof result.body).toBe('string')
    expect(result.statusCode).toBe(200)
    expect(result.isBase64Encoded).toBe(false)
    expect(result.headers['access-control-allow-origin']).toBe('*')

    const body = JSON.parse(result.body)
    expect(typeof body).toBe('object')

    done()
  }

  handler(event, context, callback)
})

test('use should return instance of application', () => {
  const app = new KomposeLambda()

  const app2 = app.use(() => {})

  expect(app2).toBeInstanceOf(KomposeLambda)
})

test('getHandler should return a 3 parameter function', () => {
  const app = new KomposeLambda()

  const handler = app.getHandler()

  expect(handler).toHaveLength(3)
})

test('handler should return a promise', () => {
  const app = new KomposeLambda()

  expect(app.getHandler()({}, {}, () => {}))
    .toBeInstanceOf(Promise)
})

test('non function middleware', () => {
  const app = new KomposeLambda()

  expect(() => {
    app.use('non-function')
  }).toThrow()
})

test('invalid options should throw', () => {
  const invalidOpts = [
    {
      createContext: 'test'
    },
    {
      handleError: {}
    }
  ]

  invalidOpts.forEach(opts => {
    expect(() => {
      const app = (new KomposeLambda(opts))
      app.getHandler()
    }).toThrow(TypeError)
  })
})

test('should use provided createContext function', done => {
  const opts = {
    createContext: jest.fn(),
    afterChain: jest.fn()
  }

  const app = new KomposeLambda(opts)

  app.getHandler()({}, {}, () => {})
    .then(() => {
      expect(opts.createContext).toHaveBeenCalled()
      done()
    })
})

test('should use provided handleError function', () => {
  const errorHandler = jest.fn()

  const app = new KomposeLambda()
  app.use(() => {
    return Promise((resolve, reject) => {
      reject(new Error())
    })
  })

  app.error(errorHandler)

  app.getHandler()({}, {}, () => {})
    .then(() => {
      expect(errorHandler).toHaveBeenCalled()
    })
})

test('final handler must be a function', () => {
  const app = new KomposeLambda()
  expect(() => {
    app.final('')
  }).toThrow()
})

test('call final handler if provided', done => {
  const app = new KomposeLambda()
  const finalHandler = jest.fn()
  app.final(finalHandler)

  app.getHandler()({}, {}, () => {})
    .then(() => {
      expect(finalHandler).toHaveBeenCalled()
      done()
    })

  const app2 = new KomposeLambda()
  const finalHandler2 = jest.fn()

  app2.getHandler()({}, {}, () => {})
    .then(() => {
      expect(finalHandler2).not.toHaveBeenCalled()
      done()
    })
})

test('middleware function returning a promise', done => {
  const app = new KomposeLambda()

  const body = {a: 'b'}
  const jsonBody = JSON.stringify(body)

  app.use(ctx => {
    ctx.result.body = body
  })

  app.final(ctx => {
    ctx.result.body = JSON.stringify(ctx.result.body)
    return new Promise((resolve, reject) => {
      resolve(ctx.result)
    })
  })

  const handler = app.getHandler()

  const result = handler({}, {})
  result.then(res => {
    expect(res.body).toBe(jsonBody)
    done()
  })
})

test('middleware function returning a promise throw error', done => {
  const app = new KomposeLambda()

  app.use(ctx => {
    return new Promise((resolve, reject) => {
      reject(new Error('test error'))
    })
  })

  app.error((err, ctx) => {
    ctx.result.body = err.message
    return new Promise((resolve, reject) => {
      reject(ctx.result)
    })
  })

  const handler = app.getHandler()

  const result = handler({}, {})
  result.catch(err => {
    expect(err.body).toBe('test error')
    done()
  })
})
