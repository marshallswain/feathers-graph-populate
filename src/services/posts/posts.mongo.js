
/* eslint quotes: 0 */
// Defines the MongoDB $jsonSchema for service `posts`.
const merge = require('lodash.merge')



let moduleExports = merge({},

  {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      title: {
        faker: "lorem.words",
        bsonType: "string"
      },
      authorId: {
        faker: {
          fk: "users:random"
        },
        bsonType: "objectId"
      }
    }
  },


)


module.exports = moduleExports



