// Define the Feathers schema for service `groups`.

// Define the model using JSON-schema
let schema = {
  title: 'Groups',
  description: 'Groups database.',

  // Required fields.
  required: [],
  // Fields with unique values.
  uniqueItemProperties: [],

  // Fields in the model.
  properties: {
    name: {
      type: 'string',
      faker: 'lorem.word',
    },
    orgId: {
      type: 'ID',
      faker: { fk: 'orgs:next:_id' },
    },
  },
};

// Define optional, non-JSON-schema extensions.
let extensions = {
  // GraphQL generation.
  graphql: {
    name: 'Group',
    service: {
      sort: { _id: 1 },
    },
    // sql: {
    //   sqlTable: 'Groups',
    //   uniqueKey: '_id',
    //   sqlColumn: {
    //     __authorId__: '__author_id__',
    //   },
    // },

    discard: [],
    add: {
      // __author__: { type: '__User__!', args: false, relation: { ourTable: '__authorId__', otherTable: '_id' } },
    },
  },
};

let moduleExports = {
  schema,
  extensions,

  populates: {
    members: {
      service: 'group-users',
      nameAs: 'members',
      keyHere: '_id',
      keyThere: 'groupId',
      asArray: true,
      params: {},
    },
    org: {
      service: 'orgs',
      nameAs: 'org',
      keyHere: 'orgId',
      keyThere: '_id',
      asArray: false,
      params: {},
    },
  },
};

module.exports = moduleExports;
