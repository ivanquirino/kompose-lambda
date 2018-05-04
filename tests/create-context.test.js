const createContext = require('../lib/create-context')

test('create context', () => {
  const ctx = createContext()

  expect(ctx).toMatchSnapshot()
})
