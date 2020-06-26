
/* eslint quotes: 0 */
// Validation definitions for validateSchema hook for service `groupUsers`.
const { validateSchema } = require('feathers-hooks-common')
const merge = require('lodash.merge')
const ajv = require('ajv')




// eslint-disable-next-line no-unused-vars
const ID = 'string'


let base = merge({},

  {
    title: "GroupUsers",
    description: "GroupUsers database.",
    fakeRecords: 10,
    required: [],
    uniqueItemProperties: [],
    properties: {
      userId: {
        type: ID,
        faker: {
          fk: "users:next:_id"
        }
      },
      userFirstName: {
        type: "string",
        faker: {
          fk: "users:next:firstName"
        }
      },
      userLastName: {
        type: "string",
        faker: {
          fk: "users:next:lastName"
        }
      },
      orgId: {
        type: ID,
        faker: {
          fk: "orgs:next:_id"
        }
      },
      orgName: {
        type: "string",
        faker: {
          fk: "orgs:next:name"
        }
      },
      groupId: {
        type: ID,
        faker: {
          fk: "groups:next:_id"
        }
      },
      groupName: {
        type: "string",
        faker: {
          fk: "groups:next:name"
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



