---
title: Getting Started
sidebarDepth: 3
---

<!--- Usage ------------------------------------------------------------------------------------ -->
[![Build Status](https://travis-ci.org/marshallswain/feathers-graph-populate.png?branch=master)](https://travis-ci.org/marshallswain/feathers-graph-populate)
[![Dependency Status](https://img.shields.io/david/marshallswain/feathers-graph-populate.svg?style=flat-square)](https://david-dm.org/marshallswain/feathers-graph-populate)
[![Download Status](https://img.shields.io/npm/dm/feathers-graph-populate.svg?style=flat-square)](https://www.npmjs.com/package/feathers-graph-populate)

![feathers-graph-populate logo](/img/graph-populate-logo.png)

## About

This project is built for [FeathersJS](http://feathersjs.com). An open source web framework for building modern real-time applications.

## Installation

```
npm i feathers-graph-populate

yarn add feathers-graph-populate
```

## Getting Started

### Define the Relationships

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

### Create Named Queries

To keep API security simpler, this package only accepts a query name from extrnal requests.  We need to pre-configure a few named queries for connected clients to use:

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

The first level of keys in the `namedQueries` object contains the names of each query.  So, the first query above is called `withPosts`.  Its query is `{ posts: {} }`.  It tells `feathers-graph-populate` to load all records on the `posts` relationship that was defined in the previous step.  All records are populated with a single query.

The second query, above, is called `postsWithComments`. The query is `{ posts: { comments: {} } }`.  This tells `feathers-graph-populate` to pull in the `posts` relationship.  The posts are populated with a single query, then the `comments` are populated onto the posts with one additional query.

The last query, above, is called `postsWithCommentsWithUser`.  The query is `{ posts: { comments: { user: {} } } }`, which tells `feathers-graph-populate` to perform three queries, one at each level.

### Register the Populate Hook

The populate hook will need to be registered on all services on which you wish to populate data AND their target populates.  For the query examples, above, the `posts`, `comments`, and `users` services will all require the hook to be registered as an "after all" hook:

```js
const { populate } = require('feathers-graph-populate')

const populates = { /* See above */ }
const namedQueries = { /* See above */ }

const hooks = {
  after: {
    all: [
      populate({ populates, namedQueries })
    ]
  }
}
```

### Enable Custom Client-Side Params

Since FeathersJS only supports passing `params.query` from client to server, by default, we need to let it know about the new `$populateParams` object.  We can do this using the `paramsForServer` and `paramsFromClient` hooks:

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

> Notice that the `populateParams` is a custom `param`, so it is outside of the `query` object.

For internal requests, in addition to supporting named queries, you can directly provide a query object.  This allows custom, unnamed queries like the following:

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

## Testing

`npm test`

## Help

Open an issue or come talk on the FeathersJS Slack.

## License

Licensed under the [MIT license](LICENSE).
