
// Hooks for service `users`. (Can be re-generated.)
const commonHooks = require('feathers-hooks-common')
// !code: imports
const { populates } = require('./users.schema')
const { populate } = require('../../../lib/index')
// !end

// !<DEFAULT> code: used
// eslint-disable-next-line no-unused-vars
const { iff } = commonHooks
// eslint-disable-next-line no-unused-vars
const { create, update, patch, validateCreate, validateUpdate, validatePatch } = require('./users.validate')
// !end

// !code: init
const namedQueries = {
  withPosts: {
    posts: {}
  },
  postsWithComments: {
    posts: {
      comments: {}
    }
  },
  postsWithCommentsWithUser: {
    posts: {
      comments: {
        user:{}
      }
    }
  }
}
// !end

let moduleExports = {
  before: {
    // !<DEFAULT> code: before
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
    // !end
  },

  after: {
    // !code: after
    all: [

    ],
    find: [
      populate({ populates, namedQueries })
    ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
    // !end
  },

  error: {
    // !<DEFAULT> code: error
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
    // !end
  },
  // !code: moduleExports // !end
}

// !code: exports // !end
module.exports = moduleExports

// !code: funcs // !end
// !code: end // !end
