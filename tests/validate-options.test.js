const validateOptions = require('../lib/validate-options')

test('function properties should be functions', () => {
  const opts = {
    handleError: () => {},
    createContext: () => {},
    afterChain: () => {}
  }

  expect(validateOptions(opts)).toBe(true)
})

test('any non-function properties must return `false`', () => {
  const invalidOpts = [
    {
      handleError: 'test',
      createContext: () => {},
      afterChain: () => {}
    },
    {
      handleError: () => {},
      createContext: 5,
      afterChain: () => {}
    },
    {
      handleError: () => {},
      createContext: () => {},
      afterChain: {}
    }
  ]

  invalidOpts.forEach(opts => {
    expect(validateOptions(opts)).toBe(false)
  })
})

test('should return `true` if none of the properties are used', () => {
  const opts = {
    foo: 'foo',
    bar: 'bar',
    test: 'test'
  }

  expect(validateOptions(opts)).toBe(true)
})

test('no options', () => {
  expect(validateOptions()).toBe(true)
})
