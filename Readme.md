# Kompose Lambda

**Work in Progress!**

Write AWS Lambda handlers in a [Koa](https://github.com/koajs/koa) way, a chain of middleware. Each middleware function called is wrapped in a `Promise` allowing them to be awaited. 

Uses [koa-compose](https://github.com/koajs/compose) and is heavily inspired by Koa.

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

exports.myHandler = chain.getHandler()

```