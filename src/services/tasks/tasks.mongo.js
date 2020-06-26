
/* eslint quotes: 0 */
// Defines the MongoDB $jsonSchema for service `tasks`.
const merge = require('lodash.merge')



let moduleExports = merge({},

  {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      name: {
        faker: "lorem.words",
        bsonType: "string"
      },
      ownerIds: {
        maxItems: 2,
        items: {
          type: "ID",
          faker: {
            fk: "users:random"
          }
        },
        bsonType: "array"
      },
      childTaskIds: {
        items: {
          type: "ID",
          maxItems: 5,
          faker: {
            fk: "tasks:next"
          }
        },
        bsonType: "array"
      }
    }
  },


)


module.exports = moduleExports



