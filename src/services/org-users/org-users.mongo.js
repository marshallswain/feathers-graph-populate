
/* eslint quotes: 0 */
// Defines the MongoDB $jsonSchema for service `orgUsers`.
const merge = require('lodash.merge')



let moduleExports = merge({},

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
      }
    }
  },


)


module.exports = moduleExports



