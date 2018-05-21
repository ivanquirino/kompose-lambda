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
  ctx.result.body = {first: 'Hello, '}
  await next()
  ctx.result.body.third = '!'
})

chain.use(ctx => {
  ctx.result.body.second = 'World'
})

// Register handler to be called after all middleware
// Useful to handle a final response
chain.final(ctx => {
  ctx.callback(null, ctx.result)
})

// Register an error handler to catch any errors
// Note that the middleware must be async function or
// return a promise
chain.error((err,ctx) => {
  console.error(err)
})

// Get the handler
exports.myHandler = chain.getHandler()

```
