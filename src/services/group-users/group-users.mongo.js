
/* eslint quotes: 0 */
// Defines the MongoDB $jsonSchema for service `groupUsers`. (Can be re-generated.)
const merge = require('lodash.merge')
// !code: imports // !end
// !code: init // !end

let moduleExports = merge({},
  // !<DEFAULT> code: model
  {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      userId: {
        faker: {
          fk: "users:next:_id"
        },
        bsonType: "objectId"
      },
      userFirstName: {
        faker: {
          fk: "users:next:firstName"
        },
        bsonType: "string"
      },
      userLastName: {
        faker: {
          fk: "users:next:lastName"
        },
        bsonType: "string"
      },
      orgId: {
        faker: {
          fk: "orgs:next:_id"
        },
        bsonType: "objectId"
      },
      orgName: {
        faker: {
          fk: "orgs:next:name"
        },
        bsonType: "string"
      },
      groupId: {
        faker: {
          fk: "groups:next:_id"
        },
        bsonType: "objectId"
      },
      groupName: {
        faker: {
          fk: "groups:next:name"
        },
        bsonType: "string"
      }
    }
  },
  // !end
  // !code: moduleExports // !end
)

// !code: exports // !end
module.exports = moduleExports

// !code: funcs // !end
// !code: end // !end
