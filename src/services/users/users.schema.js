
// Define the Feathers schema for service `users`. (Can be re-generated.)

// Define the model using JSON-schema
let schema = {
  title: 'Users',
  description: 'Users database.',
  fakeRecords: 5,

  // Required fields.
  required: [
  ],
  // Fields with unique values.
  uniqueItemProperties: [
  ],

  // Fields in the model.
  properties: {
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
  },
}

// Define optional, non-JSON-schema extensions.
let extensions = {
  // GraphQL generation.
  graphql: {
    name: 'User',
    service: {
      sort: { _id: 1 },
    },
    discard: [
    ],
    add: {
    },
  },
}

let moduleExports = {
  schema,
  extensions,
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
}

module.exports = moduleExports
