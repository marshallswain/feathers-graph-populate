
// Define the Feathers schema for service `users`. (Can be re-generated.)
// !code: imports // !end
// !code: init // !end

// Define the model using JSON-schema
let schema = {
  // !<DEFAULT> code: schema_header
  title: 'Users',
  description: 'Users database.',
  // !end
  // !code: schema_definitions
  fakeRecords: 5,
  // !end

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
    firstName: {
      type: 'string',
      faker: 'name.firstName'
    },
    lastName: {
      type: 'string',
      faker: 'name.lastName'
    },
    email: {
      type: 'string',
      faker: 'internet.email'
    },
    password: {
      type: 'string',
      faker: { exp: 'ctx.hashPassword("12341234")' }
    },
    // !end
  },
  // !code: schema_more // !end
}

// Define optional, non-JSON-schema extensions.
let extensions = {
  // GraphQL generation.
  graphql: {
    // !code: graphql_header
    name: 'User',
    service: {
      sort: { _id: 1 },
    },
    // sql: {
    //   sqlTable: 'Users',
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
    orgMemberships: {
      service: 'org-users',
      nameAs: 'orgMemberships',
      keyHere: '_id',
      keyThere: 'userId',
      asArray: true,
      params: {}
    },
    groupMemberships: {
      service: 'group-users',
      nameAs: 'groupMemberships',
      keyHere: '_id',
      keyThere: 'userId',
      asArray: true,
      params: {}
    },
    posts: {
      service: 'posts',
      nameAs: 'posts',
      keyHere: '_id',
      keyThere: 'authorId',
      asArray: true,
      params: {}
    },
    comments: {
      service: 'comments',
      nameAs: 'comments',
      keyHere: '_id',
      keyThere: 'userId',
      asArray: true,
      params: {}
    },
    tasks: {
      service: 'tasks',
      nameAs: 'tasks',
      keyHere: '_id',
      keyThere: 'ownerIds',
      asArray: true,
      params: {}
    }
  }
  // !end
}

// !code: exports // !end
module.exports = moduleExports

// !code: funcs // !end
// !code: end // !end
