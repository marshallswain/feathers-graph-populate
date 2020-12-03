// Hooks for service `users`.
const commonHooks = require('feathers-hooks-common');
const graphPopulateOptions = require('./users.graph-populate');
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
    find: [populate(graphPopulateOptions)],
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
