# Kompose Lambda
[![Build Status](https://travis-ci.com/ivanquirino/kompose-lambda.svg?branch=master)](https://travis-ci.com/ivanquirino/kompose-lambda)

Write AWS Lambda handlers in a [Koa](https://github.com/koajs/koa) way, a chain of middleware functions that can be awaited.

Uses [koa-compose](https://github.com/koajs/compose) and is heavily inspired by Koa. In fact, this wouldn't be possible if it weren't for these two great projects.

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

Second example returning in final handler (Node 8.10:

```javascript
const KomposeLambda = require('kompose-lambda')

const chain = new KomposeLambda()

// It is also possible to add an error handler first so you can build error responses
chain.use(async (ctx, next) => {
  try {
    await next()
  } catch(e) {
    ctx.result.statusCode = 500
    ctxt.result.body = e.name
  }
})

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
  ctx.result.statusCode = ctx.result.statusCode || 200
  ctx.result.headers['Content-Type'] = 'text/plain'
  ctx.result.body = JSON.stringify(ctx.result.body)
  return ctx.result
})

// Get the handler
module.exports.myHandler = chain.getHandler()

```

## Installation

```shell
yarn add kompose-lambda"
```
or
```shell
npm install --save kompose-lambda"
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

Adds a final function to the chain which is called only with the `ctx` argument. It is useful to handle default responses, or to handle whatever you want before calling the response callback. It is also possible to return a promise or return in an async function.

### chain.error(function)

Adds an error handler to the chain to . If your middleware functions are all `async` or return a `Promise`, you can catch any errors in the chain, considering you have not handled the error before. Receives `err` and `ctx` arguments. If you return instead of calling the `callback` argument from `ctx`, you are returning an error to AWS.

## Contributing

If you have an issue, question or bug to report, please feel fre to open an issue. I'll try my best to answer or fix any issue. Feel free to open a PR if you want.