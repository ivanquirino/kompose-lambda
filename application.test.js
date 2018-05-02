const Quirino = require('./application')

test('application/json response', done => {
  const event = {}
  const context = {}

  const app = new Quirino()

  app.use(async (ctx, next) => {
    ctx.result.headers['access-control-allow-origin'] = '*'
    await next()
  })

  app.use(async (ctx) => {
    ctx.result.statusCode = 200
    ctx.result.body = {test: 'first', second: 'yo'}
    ctx.result.body = JSON.stringify(ctx.result.body)

    ctx.callback(null, ctx.result)
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
