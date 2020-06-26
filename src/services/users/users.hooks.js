// Hooks for service `users`.
const commonHooks = require('feathers-hooks-common');
const { populates } = require('./users.schema');
const { populate } = require('../../../lib/index');

/* eslint no-unused-vars:0 */
const { iff } = commonHooks;
const {
  create,
  update,
  patch,
  validateCreate,
  validateUpdate,
  validatePatch,
} = require('./users.validate');

const namedQueries = {
  withPosts: {
    posts: {},
  },
  postsWithComments: {
    posts: {
      comments: {},
    },
  },
  postsWithCommentsWithUser: {
    posts: {
      comments: {
        user: {},
      },
    },
  },
};

let moduleExports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [populate({ populates, namedQueries })],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};

module.exports = moduleExports;
