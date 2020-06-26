/* eslint quotes: 0 */
// Validation definitions for validateSchema hook for service `tasks`.
const { validateSchema } = require('feathers-hooks-common');
const merge = require('lodash.merge');
const ajv = require('ajv');

/* eslint no-unused-vars:0 */
const ID = 'string';

let base = merge(
  {},

  {
    title: 'Tasks',
    description: 'Tasks database.',
    fakeRecords: 50,
    required: [],
    uniqueItemProperties: [],
    properties: {
      name: {
        type: 'string',
        faker: 'lorem.words',
      },
      ownerIds: {
        type: 'array',
        maxItems: 2,
        items: {
          type: ID,
          faker: {
            fk: 'users:random',
          },
        },
      },
      childTaskIds: {
        type: 'array',
        items: {
          type: ID,
          maxItems: 5,
          faker: {
            fk: 'tasks:next',
          },
        },
      },
    },
  }
);

let create = merge({}, base);

let update = merge({}, base);

let patch = merge({}, base);
delete patch.required;

let validateCreate = (options) => {
  return validateSchema(create, ajv, options);
};

let validateUpdate = (options) => {
  return validateSchema(update, ajv, options);
};

let validatePatch = (options) => {
  return validateSchema(patch, ajv, options);
};

let quickValidate = (method, data, options) => {
  try {
    if (method === 'create') {
      validateCreate(options)({ type: 'before', method: 'create', data });
    }
    if (method === 'update') {
      validateCreate(options)({ type: 'before', method: 'update', data });
    }
    if (method === 'patch') {
      validateCreate(options)({ type: 'before', method: 'patch', data });
    }
  } catch (err) {
    return err;
  }
};

let moduleExports = {
  create,
  update,
  patch,
  validateCreate,
  validateUpdate,
  validatePatch,
  quickValidate,
};

module.exports = moduleExports;
