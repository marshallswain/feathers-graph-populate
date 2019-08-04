
// Define the Feathers schema for service `groups`. (Can be re-generated.)
// !code: imports // !end
// !code: init // !end

// Define the model using JSON-schema
let schema = {
  // !<DEFAULT> code: schema_header
  title: 'Groups',
  description: 'Groups database.',
  // !end
  // !code: schema_definitions // !end

  // Required fields.
  required: [
    // !code: schema_required // !end
  ],
  // Fields with unique values.
  uniqueItemProperties: [
    // !code: schema_unique // !end
  ],

  // Fields in the model.
  properties: {
    // !code: schema_properties
    name: {
      type: 'string',
      faker: 'lorem.word'
    },
    orgId: {
      type: 'ID',
      faker: { fk: 'orgs:next:_id' }
    }
    // !end
  },
  // !code: schema_more // !end
}

// Define optional, non-JSON-schema extensions.
let extensions = {
  // GraphQL generation.
  graphql: {
    // !code: graphql_header
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
    // !end
    discard: [
      // !code: graphql_discard // !end
    ],
    add: {
      // !<DEFAULT> code: graphql_add
      // __author__: { type: '__User__!', args: false, relation: { ourTable: '__authorId__', otherTable: '_id' } },
      // !end
    },
    // !code: graphql_more // !end
  },
}

// !code: more // !end

let moduleExports = {
  schema,
  extensions,
  // !code: moduleExports
  populates: {
    members: {
      service: 'group-users',
      nameAs: 'members',
      keyHere: '_id',
      keyThere: 'groupId',
      asArray: true,
      params: {}
    },
    org: {
      service: 'orgs',
      nameAs: 'org',
      keyHere: 'orgId',
      keyThere: '_id',
      asArray: false,
      params: {}
    },

  }
  // !end
}

// !code: exports // !end
module.exports = moduleExports

// !code: funcs // !end
// !code: end // !end
