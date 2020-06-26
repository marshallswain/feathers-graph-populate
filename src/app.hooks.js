
// Application hooks that run for every service.
const commonHooks = require('feathers-hooks-common')

const log = require('./hooks/log')



// eslint-disable-next-line no-unused-vars
const { iff } = commonHooks



let moduleExports = {
  before: {

    all: [ log() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []

  },

  after: {

    all: [ log() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []

  },

  error: {

    all: [ log() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []

  },

}


module.exports = moduleExports



