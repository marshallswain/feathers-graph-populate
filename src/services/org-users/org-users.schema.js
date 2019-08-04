
// Define the Feathers schema for service `orgUsers`. (Can be re-generated.)
// !code: imports // !end
// !code: init // !end

// Define the model using JSON-schema
let schema = {
  // !<DEFAULT> code: schema_header
  title: 'OrgUsers',
  description: 'OrgUsers database.',
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
    userId: {
      type: 'ID',
      faker: { fk: 'users:next:_id' }
    },
    userFirstName: {
      type: 'string',
      faker: { fk: 'users:next:firstName'}
    },
    userLastName: {
      type: 'string',
      faker: { fk: 'users:next:lastName'}
    },
    orgId: {
      type: 'ID',
      faker: { fk: 'orgs:next:_id' }
    },
    orgName: {
      type: 'string',
      faker: { fk: 'orgs:next:name' }
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
    name: 'OrgUser',
    service: {
      sort: { _id: 1 },
    },
    // sql: {
    //   sqlTable: 'OrgUsers',
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
    org: {
      service: 'orgs',
      nameAs: 'org',
      keyHere: 'orgId',
      keyThere: '_id',
      asArray: false,
      params: {}
    },
    user: {
      service: 'users',
      nameAs: 'user',
      keyHere: 'userId',
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
