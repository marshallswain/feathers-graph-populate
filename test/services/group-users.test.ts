import assert from 'assert'
import app from '../../src/app'

describe('\'groupUsers\' service', () => {
  it('registered the service', () => {
    const service = app.service('group-users')

    assert.ok(service, 'Registered the service')
  })
})
