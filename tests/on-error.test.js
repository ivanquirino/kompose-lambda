const onError = require('../lib/on-error')

describe('app.onerror(err)', () => {
  beforeEach(() => {
    global.console = jest.genMockFromModule('console')
  })

  afterEach(() => {
    global.console = require('console')
  })

  test('should throw an error if a non-error is given', () => {
    expect(() => {
      onError('non-error')
    }).toThrow()
  })

  test('should log to stderr', () => {
    const error = new Error('my-error')
    error.stack = 'my-stack'

    onError(error)

    const stderr = console.error.mock.calls.join('\n') // eslint-disable-line    

    expect(stderr).toBe('my-stack')
  })

  test('should log error.toString() if stack is null', () => {
    const error = new Error('my-error')
    error.stack = null

    onError(error)

    const stderr = console.error.mock.calls.join('\n') // eslint-disable-line    

    expect(stderr).toBe('Error: my-error')
  })
})
