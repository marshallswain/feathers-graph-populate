
/* eslint quotes: 0 */
// Defines the MongoDB $jsonSchema for service `orgs`.
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
        faker: "company.companyName",
        bsonType: "string"
      }
    }
  },


)


module.exports = moduleExports



