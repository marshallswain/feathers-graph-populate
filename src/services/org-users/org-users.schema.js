
// Define the Feathers schema for service `orgUsers`.



// Define the model using JSON-schema
let schema = {

  title: 'OrgUsers',
  description: 'OrgUsers database.',


  fakeRecords: 10,


  // Required fields.
  required: [

  ],
  // Fields with unique values.
  uniqueItemProperties: [

  ],

  // Fields in the model.
  properties: {

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

  },

}

// Define optional, non-JSON-schema extensions.
let extensions = {
  // GraphQL generation.
  graphql: {

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

}


module.exports = moduleExports



