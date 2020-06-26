
// Define the Feathers schema for service `tasks`.



// Define the model using JSON-schema
let schema = {

  title: 'Tasks',
  description: 'Tasks database.',


  fakeRecords: 50,


  // Required fields.
  required: [

  ],
  // Fields with unique values.
  uniqueItemProperties: [

  ],

  // Fields in the model.
  properties: {

    name: {
      type: 'string',
      faker: 'lorem.words'
    },
    ownerIds: {
      type: 'array',
      maxItems: 2,
      items: {
        type: 'ID',
        faker: { fk: 'users:random' }
      }
    },
    childTaskIds: {
      type: 'array',
      items: {
        type: 'ID',
        maxItems: 5,
        faker: { fk: 'tasks:next'}
      }
    }

  },

}

// Define optional, non-JSON-schema extensions.
let extensions = {
  // GraphQL generation.
  graphql: {

    name: 'Task',
    service: {
      sort: { _id: 1 },
    },
    // sql: {
    //   sqlTable: 'Tasks',
    //   uniqueKey: '_id',
    //   sqlColumn: {
    //     __authorId__: '__author_id__',
    //   },
    // },

    discard: [

    ],
    add: {

      // __author__: { type: '__User__!', args: false, relation: { ourTable: '__authorId__', otherTable: '_id' } },

    },

  },
}



let moduleExports = {
  schema,
  extensions,

  populates: {
    users: {
      service: 'users',
      nameAs: 'users',
      keyHere: 'ownerIds',
      keyThere: '_id',
      asArray: true,
      params: {}
    },
    childTasks: {
      service: 'tasks',
      nameAs: 'childTasks',
      keyHere: 'childTaskIds',
      keyThere: '_id',
      asArray: true,
      params: {}
    },

  }

}


module.exports = moduleExports



