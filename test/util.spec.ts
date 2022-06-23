import { getMessage } from '../src/utils'
test('expected message returned', () => {
    expect(getMessage()).toBe('hello')
})
