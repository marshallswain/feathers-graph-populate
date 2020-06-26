/* eslint quotes: 0 */
// Defines the MongoDB $jsonSchema for service `groups`.
const merge = require('lodash.merge');

let moduleExports = merge(
  {},

  {
    bsonType: 'object',
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: 'objectId',
      },
      name: {
        faker: 'lorem.word',
        bsonType: 'string',
      },
      orgId: {
        faker: {
          fk: 'orgs:next:_id',
        },
        bsonType: 'objectId',
      },
    },
  }
);

module.exports = moduleExports;
