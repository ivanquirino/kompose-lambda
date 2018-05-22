# Kompose Lambda

**Work in Progress! It is not published yet on npm.**

Write AWS Lambda handlers in a [Koa](https://github.com/koajs/koa) way, a chain of middleware functions that can be awaited.

Uses [koa-compose](https://github.com/koajs/compose) and is heavily inspired by Koa.

For it to work, your middleware functions must be `async` functions or return a `Promise`

Example:

```javascript
const KomposeLambda = require('kompose-lambda')

const chain = new KomposeLambda()

// Add middleware to the chain
chain.use(async (ctx, next) => {
  const body = ctx.event.body
  ctx.result.body = {first: `Hello, ${body.name}'s `}
  await next()
  ctx.result.body.third = '!'
})

chain.use(ctx => {
  ctx.result.body.second = 'World'
})

// Register handler to be called after all middleware
// Useful to handle default responses
chain.final(ctx => {
  ctx.result.statusCode = 200
  ctx.result.headers['Content-Type'] = 'text/plain'
  ctx.callback(null, ctx.result)
})

// Register an error handler to catch any errors
// Note that the middleware must be async function or
// return a promise
chain.error((err, ctx) => {
  console.error(err)

  ctx.result.statusCode = 500
  ctx.result.body = ''
  ctx.callback(null, ctx.result)
})

// Get the handler
module.exports.myHandler = chain.getHandler()

```

## Installation

Add this to your dependencies on `package.json`:
```json
"kompose-lambda": "ivanquirino/kompose-lambda"
```
## API

### Constructor

```javascript
const options = {
  createContext: (event, context, callback) => {}
}

const chain = new KomposeLambda(options)
```

You can provide a createContext function as the only option. This allows you to enhance the context object with whatever you would like. For example, you could wrap the event with some utilities. Currently it only supports AWS Lambda's handler signature. If no options are provided, it uses the default createContext function, which generates a context object with the following shape:

```javascript
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
```
The default createContext function just forwards AWS Lambda's arguments to the context object:

```javascript
function createContext (event, context, callback) {
  const ctx = Object.assign({}, defaultContext)

  ctx.event = event
  ctx.context = context
  ctx.callback = callback

  return ctx
}
```

### chain.use(function)

Adds a middleware function to the chain, which will be called with `ctx` and `next` arguments. Calling `next()` is not required. You can await the `next()` call to run any code after the next middleware.

### chain.final(function)

Adds a final function to the chain which is called only with the `ctx` argument. It is useful to handle default responses, or to handle whatever you want before calling the response callback.

### chain.error(function)

Adds an error handler to the chain. If your middleware functions are all `async` or return a `Promise`, you can catch any errors in the chain, considering you have not handled the error before. Receives `err` and `ctx` arguments