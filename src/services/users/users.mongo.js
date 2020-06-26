
/* eslint quotes: 0 */
// Defines the MongoDB $jsonSchema for service `users`. 
const merge = require('lodash.merge')

let moduleExports = merge({},
  // !<DEFAULT> code: model
  {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      firstName: {
        faker: "name.firstName",
        bsonType: "string"
      },
      lastName: {
        faker: "name.lastName",
        bsonType: "string"
      },
      email: {
        faker: "internet.email",
        bsonType: "string"
      },
      password: {
        faker: {
          exp: "ctx.hashPassword(\"12341234\")"
        },
        bsonType: "string"
      }
    }
  },
)

module.exports = moduleExports
