# Kompose Lambda

**Work in Progress!**

Write AWS Lambda handlers in a [Koa](https://github.com/koajs/koa) way, a chain of middleware. Each middleware function called is wrapped in a `Promise` allowing to be awaited. 

Uses [koa-compose](https://github.com/koajs/compose) and is heavily inspired by Koa.

```javascript
const chain = new KomposeLambda()

chain.use(async (ctx, next) => {
  ctx.result.body = {first: 'Hello, '}
  await next()
  ctx.result.body.third = '!'
})

chain.use(ctx => {
  ctx.result.body.second = 'World'
})

chain.final(ctx => {
  ctx.callback(null, ctx.result)
})

```