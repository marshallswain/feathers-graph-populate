import assert from 'assert'
import app from '../../src/app'

describe('\'orgUsers\' service', () => {
  it('registered the service', () => {
    const service = app.service('org-users')

    assert.ok(service, 'Registered the service')
  })
})
