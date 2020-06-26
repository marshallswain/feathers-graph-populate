// Define the Feathers schema for service `comments`.

// Define the model using JSON-schema
let schema = {
  title: 'Comments',
  description: 'Comments database.',
  fakeRecords: 40,

  // Required fields.
  required: [],
  // Fields with unique values.
  uniqueItemProperties: [],

  // Fields in the model.
  properties: {
    text: {
      type: 'string',
      faker: 'lorem.sentence',
    },
    userId: {
      type: 'ID',
      faker: { fk: 'users:next:_id' },
    },
    userFirstName: {
      type: 'string',
      faker: { fk: 'users:next:firstName' },
    },
    userLastName: {
      type: 'string',
      faker: { fk: 'users:next:lastName' },
    },
    postId: {
      type: 'ID',
      faker: { fk: 'posts:next:_id' },
    },
  },
};

// Define optional, non-JSON-schema extensions.
let extensions = {
  // GraphQL generation.
  graphql: {
    name: 'Comment',
    service: {
      sort: { _id: 1 },
    },
    discard: [],
    add: {},
  },
};

let moduleExports = {
  schema,
  extensions,
  populates: {
    user: {
      service: 'users',
      nameAs: 'user',
      keyHere: 'userId',
      keyThere: '_id',
      asArray: false,
      params: {},
    },
    post: {
      service: 'posts',
      nameAs: 'post',
      keyHere: 'postId',
      keyThere: '_id',
      asArray: false,
      params: {},
    },
  },
};

module.exports = moduleExports;
