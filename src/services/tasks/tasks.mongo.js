
/* eslint quotes: 0 */
// Defines the MongoDB $jsonSchema for service `tasks`. (Can be re-generated.)
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
      name: {
        faker: "lorem.words",
        bsonType: "string"
      },
      ownerIds: {
        maxItems: 10,
        items: {
          type: "ID",
          faker: {
            fk: "users:next"
          }
        },
        bsonType: "array"
      },
      childTasksIds: {
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
  // !end
  // !code: moduleExports // !end
)

// !code: exports // !end
module.exports = moduleExports

// !code: funcs // !end
// !code: end // !end
