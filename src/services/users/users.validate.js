
/* eslint quotes: 0 */
// Validation definitions for validateSchema hook for service `users`.
const { validateSchema } = require('feathers-hooks-common')
const merge = require('lodash.merge')
const ajv = require('ajv')

// eslint-disable-next-line no-unused-vars
const ID = 'string'

let base = merge({},
  {
    title: "Users",
    description: "Users database.",
    fakeRecords: 5,
    required: [],
    uniqueItemProperties: [],
    properties: {
      firstName: {
        type: "string",
        faker: "name.firstName"
      },
      lastName: {
        type: "string",
        faker: "name.lastName"
      },
      email: {
        type: "string",
        faker: "internet.email"
      },
      password: {
        type: "string",
        faker: {
          exp: "ctx.hashPassword(\"12341234\")"
        }
      }
    }
  },
)

let create = merge({},
  base,
)

let update = merge({},
  base,
)

let patch = merge({},
  base,
)
delete patch.required

let validateCreate = options => {
  return validateSchema(create, ajv, options)
}

let validateUpdate = options => {
  return validateSchema(update, ajv, options)
}

let validatePatch = options => {
  return validateSchema(patch, ajv, options)
}

let quickValidate = (method, data, options) => {
  try {
    if (method === 'create') { validateCreate(options)({ type: 'before', method: 'create', data }) }
    if (method === 'update') { validateCreate(options)({ type: 'before', method: 'update', data }) }
    if (method === 'patch') { validateCreate(options)({ type: 'before', method: 'patch', data }) }
  } catch (err) {
    return err
  }
}

let moduleExports = {
  create,
  update,
  patch,
  validateCreate,
  validateUpdate,
  validatePatch,
  quickValidate,
}

module.exports = moduleExports
