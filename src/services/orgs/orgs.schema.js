
// Define the Feathers schema for service `orgs`.



// Define the model using JSON-schema
let schema = {

  title: 'Orgs',
  description: 'Orgs database.',



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
      faker: 'company.companyName'
    }

  },

}

// Define optional, non-JSON-schema extensions.
let extensions = {
  // GraphQL generation.
  graphql: {

    name: 'Org',
    service: {
      sort: { _id: 1 },
    },
    // sql: {
    //   sqlTable: 'Orgs',
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
    members: {
      service: 'org-users',
      nameAs: 'members',
      keyHere: '_id',
      keyThere: 'orgId',
      asArray: true,
      params: {}
    },
    groups: {
      service: 'groups',
      nameAs: 'groups',
      keyHere: '_id',
      keyThere: 'orgId',
      asArray: true,
      params: {}
    },

  }

}


module.exports = moduleExports



