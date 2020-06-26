<img 
  src="https://feathers-graph-populate.netlify.app/img/graph-populate-logo.png" 
  alt="Feathers Graph Populate"
  style="margin: 0 auto; max-width: 60%"
/>

# feathers-graph-populate

Add lightning fast, GraphQL-like populates to your FeathersJS API.

This project is built for [FeathersJS](http://feathersjs.com). An open source web framework for building modern real-time applications.

## Getting Started

### Define your relationships

The top-level keys in the `populates` represent the name of the relationship.

```js
const populates = {
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
```

### Create named queries to use from connected clients.

The top-level keys in the `nameQueries` object are the query names. Nested keys under the query name refer to the name of the relationship, found in the `populates` object from the previous code snippet.

```js
const namedQueries = {
  withPosts: {
    posts: {}
  },
  postsWithComments: {
    posts: {
      comments: {}
    }
  },
  postsWithCommentsWithUser: {
    posts: {
      comments: {
        user:{}
      }
    }
  }
}
```

### Register the hook

```js
const { populate } = require('feathers-graph-populate')

const hooks = {
  after: {
    all: [
      populate({ populates, namedQueries })
    ]
  }
}
```

### Perform Queries

Use a named query from a connected client:

```js
feathersClient.service('users').find({
  query: {},
  $populateParams: {
    name: 'postsWithCommentsWithUser'
  }
})
```

Use a query object for internal requests. (named queries also work, internally):

```js
app.service('users').find({
  query: {},
  $populateParams: {
    query: {
      posts: {
        comments: {
          user:{}
        }
      }
    }
  }
})
```

### Handling Custom Client-Side Params

Since FeathersJS only supports passing `params.query` from client to server, by default, we need to let it know about the new `$populateParams` object.  We can do this using the `paramsForServer` and `paramsFromCLient` hooks:

```js
const { paramsForServer } = require('feathers-graph-populate')

feathersClient.hooks({
  before: {
    all: [
      paramsForServer('$populateParams')
    ]
  }
})
```

Now to allow the API server to receive the custom param:

```js
const { paramsFromClient } = require('feathers-graph-populate')

feathersClient.hooks({
  before: {
    all: [
      paramsFromClient('$populateParams')
    ]
  }
})
```

## Testing

Simply run `npm test` and all your tests in the `test/` directory will be run.


## Help

For more information on all the things you can do, visit [the generator](https://generator.feathers-plus.com/), [FeathersJS](http://docs.feathersjs.com) and [extensions](https://feathers-plus.github.io/).


## License

Licensed under the [MIT license](LICENSE).
