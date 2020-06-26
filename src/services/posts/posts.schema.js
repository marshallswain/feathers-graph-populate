
// Define the Feathers schema for service `posts`.
// Define the model using JSON-schema
let schema = {
  title: 'Posts',
  description: 'Posts database.',
  fakeRecords: 20,
  required: [],

  // Fields with unique values.
  uniqueItemProperties: [],

  // Fields in the model.
  properties: {
    title: {
      type: 'string',
      faker: 'lorem.words'
    },
    authorId: {
      type: 'ID',
      faker: { fk: 'users:random' }
    }
  },
}

// Define optional, non-JSON-schema extensions.
let extensions = {
  // GraphQL generation.
  graphql: {
    name: 'Post',
    service: {
      sort: { _id: 1 },
    },
    // sql: {
    //   sqlTable: 'Posts',
    //   uniqueKey: '_id',
    //   sqlColumn: {
    //     __authorId__: '__author_id__',
    //   },
    // },
    discard: [],
    add: {},
  },
}

let moduleExports = {
  schema,
  extensions,

  populates: {
    author: {
      service: 'users',
      nameAs: 'author',
      keyHere: 'authorId',
      keyThere: '_id',
      asArray: false,
      params: {}
    },
    comments: {
      service: 'comments',
      nameAs: 'comments',
      keyHere: '_id',
      keyThere: 'postId',
      asArray: true,
      params: {}
    },
  }
}

module.exports = moduleExports



