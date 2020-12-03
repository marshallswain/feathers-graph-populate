// Define the Feathers schema for service `users`.
const { populates, namedQueries } = require('./users.graph-populate')

// Define the model using JSON-schema
let schema = {
  title: 'Users',
  description: 'Users database.',
  fakeRecords: 5,

  // Required fields.
  required: [],
  // Fields with unique values.
  uniqueItemProperties: [],

  // Fields in the model.
  properties: {
    firstName: {
      type: 'string',
      faker: 'name.firstName',
    },
    lastName: {
      type: 'string',
      faker: 'name.lastName',
    },
    email: {
      type: 'string',
      faker: 'internet.email',
    },
    password: {
      type: 'string',
      faker: { exp: 'ctx.hashPassword("12341234")' },
    },
  },
};

// Define optional, non-JSON-schema extensions.
let extensions = {
  // GraphQL generation.
  graphql: {
    name: 'User',
    service: {
      sort: { _id: 1 },
    },
    discard: [],
    add: {},
  },
};

module.exports = {
  schema,
  extensions,
  populates,
  namedQueries
};
