import assert from 'assert'
import app from '../../src/app'

describe('\'posts\' service', () => {
  it('registered the service', () => {
    const service = app.service('posts')

    assert.ok(service, 'Registered the service')
  })
})
