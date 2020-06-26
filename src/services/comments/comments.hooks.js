// Hooks for service `comments`.
const commonHooks = require('feathers-hooks-common');
const { populates } = require('./comments.schema');
const { populate } = require('../../../lib/index');

/* eslint no-unused-vars:0 */
const { iff } = commonHooks;
/* eslint no-unused-vars:0 */
const {
  create,
  update,
  patch,
  validateCreate,
  validateUpdate,
  validatePatch,
} = require('./comments.validate');

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
    find: [populate({ populates })],
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
