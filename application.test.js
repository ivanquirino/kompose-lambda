const Quirino = require('./application')

test('application/json response', done => {
  const event = {}
  const context = {}

  const app = new Quirino()

  app.use(async (ctx, next) => {
    ctx.result.headers['access-control-allow-origin'] = '*'
    await next()
  })

  app.use(async ctx => {
    ctx.result.body = {test: 'first', second: 'yo'}
  })

  const handler = app.getHandler()

  const callback = (err, result) => {
    if (err) {
      throw err
    }

    expect(typeof result.body).toBe('string')
    expect(result.statusCode).toBe(200)
    expect(result.isBase64Encoded).toBe(false)

    const body = JSON.parse(result.body)
    expect(typeof body).toBe('object')

    done()
  }

  handler(event, context, callback)
})

test('application error 404', done => {
  const event = {}
  const context = {}

  const app = new Quirino()

  app.use(async (ctx, next) => {
    ctx.result.headers['access-control-allow-origin'] = '*'
    await next()
  })

  app.use(async ctx => {

  })

  const handler = app.getHandler()

  const callback = (err, result) => {
    if (err) {
      throw err
    }

    expect(JSON.parse(result.body).error).toBe('NotFoundError')
    expect(result.statusCode).toBe(404)
    expect(result.isBase64Encoded).toBe(false)

    done()
  }

  handler(event, context, callback)
})

test('application unhandled', done => {
  const event = {}
  const context = {}

  const app = new Quirino()

  app.use(async (ctx, next) => {
    ctx.result.headers['access-control-allow-origin'] = '*'
    await next()
  })

  app.use(async ctx => {
    throw new Error()
  })

  const handler = app.getHandler()

  const callback = (err, result) => {
    expect(err).toBeInstanceOf(Error)

    done()
  }

  handler(event, context, callback)
})

test('non function middleware', () => {
  const app = new Quirino()

  expect(() => {
    app.use('')
  }).toThrow()
})
