
/* eslint quotes: 0 */
// Defines the MongoDB $jsonSchema for service `comments`.
const merge = require('lodash.merge')

let moduleExports = merge({},
  {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      text: {
        faker: "lorem.sentence",
        bsonType: "string"
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
      postId: {
        faker: {
          fk: "posts:next:_id"
        },
        bsonType: "objectId"
      }
    }
  },
)

module.exports = moduleExports
