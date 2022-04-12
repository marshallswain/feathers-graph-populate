---
title: Getting Started
sidebarDepth: 3
---

<!--- Usage ------------------------------------------------------------------------------------ -->
[![Build Status](https://travis-ci.org/marshallswain/feathers-graph-populate.png?branch=master)](https://travis-ci.org/marshallswain/feathers-graph-populate)
[![Dependency Status](https://img.shields.io/david/marshallswain/feathers-graph-populate.svg?style=flat-square)](https://david-dm.org/marshallswain/feathers-graph-populate)
[![Download Status](https://img.shields.io/npm/dm/feathers-graph-populate.svg?style=flat-square)](https://www.npmjs.com/package/feathers-graph-populate)

<p align="center">
  <img 
    src="https://feathers-graph-populate.netlify.app/img/graph-populate-logo.png" 
    alt="Feathers Graph Populate"
    style="margin: 0 auto; max-width: 400px"
  />
</p>

## About

Add lightning fast, GraphQL-like populates to your FeathersJS API.

This project is built for [FeathersJS](http://feathersjs.com). An open source web framework for building modern real-time applications.

## Installation

```
npm i feathers-graph-populate

yarn add feathers-graph-populate
```

## Getting Started

### Setup feathers-graph-populate

Configuring `feathers-graph-populate` in the `app.js` file, allows the global use of `graph-populate-hooks`.

```js
// src/app.js
const graphPopulate = require('feathers-graph-populate')
app.configure(graphPopulate())
```

### Define the Relationships

The first step is to create a `populates` object. It's recommended that you make the first-level key names match the `nameAs` property. Doing so will reduce cognitive overhead required when building queries, later. Each item represents a populate object and will be passed directly to shallow-populate hook.

```js
const populates = {
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
  },
  openTasks: {
    service: 'tasks',
    nameAs: 'openTasks',
    keyHere: '_id',
    keyThere: 'ownerIds',
    asArray: true,
    params: {
      query: {
        completedAt: null
      }
    }
  },
  role: {
    service: 'roles',
    nameAs: 'role',
    keyHere: 'roleId',
    keyThere: '_id',
    asArray: false,
    params: {}
  }
}
```

### Options for each relationship

Each populate object must/can have the following properties:

| **Option**       | **Description** |
|------------------|-----------------|
| `service`        | The service to reference<br><br>**required**<br>**Type:** `String` |
| `nameAs`         | The property to be assigned to on this entry<br><br>**required**<br>**Type:** `String` |
| `keyHere`        | The primary or secondary key for this entry<br><br>**required if `params` is not complex (most of the time)**<br>**Type:** `String` |
| `keyThere`       | The primary or secondary key for the referenced entry/entries<br><br>**required if `keyHere` is defined**<br>**Type:** `String` |
| `asArray`        | Is the referenced item a single entry or an array of entries?<br><br>**optional - default:** `true`<br>**Type:** `Boolean`
| `requestPerItem` | Decided whether your `params` object/function runs against each item individually or bundled. Most of the time you don't need this.<br><br>**optional - default:<br>- `false`** (if `keyHere` and `keyThere` are defined)<br>- **`true`** (if `keyHere` and `keyThere` are not defined)<br>**Type:** `String`
| `catchOnError`   | Whether the hook continues populating, if an error occurs (e.g. because of missing authentication) or throws. Also can be set on the prior options<br><br>**optional - default:** `false`<br>**Type:**: `Boolean` |
| `params`         | Additional params to be passed to the underlying service.<br>You can mutate the passed `params` object or return a newly created `params` object which gets merged deeply <br>Merged deeply after the params are generated internally.<br><quote>**ProTip #1:** You can use this for adding a '$select' property or passing authentication and user data from 'context' to 'params' to restrict accesss</quote><br><quote>**ProTip #2:** If you don't define `keyHere` and `keyThere` or set `requestPerItem` to `true` the function has access to the _`this` keyword_ being the individual item the request will be made for.</quote><br><quote>**ProTip #3**: You can skip a `requestPerItem` if it returns `undefined`.</quote><br><quote>**ProTip #4**: The hook whats for async functions!</quote><br><br>**optional - default:** `{}`<br>**Possible types:**<br>- `Object`: _will be merged with params - simple requests_<br>- `Function(params, context, { path, service }) => params`: _needs to return the `params` or a new one which gets merged deeply - more complex_<br>- `Function(params, context, { path, service }) => Promise<params>`<br>- `[Object | Function]` |

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

The first level of keys in the `namedQueries` object contains the names of each query. So, the first query above is called `withPosts`.  Its query is `{ posts: {} }`. It tells `feathers-graph-populate` to load all records on the `posts` relationship that was defined in the previous step. All records are populated with a single query.

The second query, above, is called `postsWithComments`. The query is `{ posts: { comments: {} } }`. This tells `feathers-graph-populate` to pull in the `posts` relationship. The posts are populated with a single query, then the `comments` are populated onto the posts with one additional query.

The last query, above, is called `postsWithCommentsWithUser`. The query is `{ posts: { comments: { user: {} } } }`, which tells `feathers-graph-populate` to perform three queries, one at each level.

### Register the Populate Hook

The populate hook will need to be registered on all services on which you wish to populate data AND their target populates. For the query examples, above, the `posts`, `comments`, and `users` services will all require the hook to be registered as an "after all" hook:

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

The `option` object for the hook can have the following properties:
- `populates {Object}` (**required**) the possible relations (see above).
- `namedQueries {Object}` (__optional__) makes queries simpler - required for external queries, highly recommended for internal queries (see above).
- `defaultQueryName {String}` - (__optional__) You can set a default `namedQuery`. If set, it has to be one of the defined `namedQueries`.

### Enable Custom Client-Side Params

Since FeathersJS only supports passing `params.query` from client to server, by default, we need to let it know about the new `$populateParams` object. We can do this using the `paramsForServer` and `paramsFromClient` hooks:

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

> Notice that the `$populateParams` is a custom `param`, so it is outside of the `query` object.

### Unnamed Queries (internal only)

For internal requests, in addition to supporting named queries, you can directly provide a query object. This allows custom, unnamed queries like the following:

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

### Custom Querying

In addition to the `params` object that can be defined in the relations object, you can also make a custom query within the named/unnamed queries. The filters `$select`, `$limit`, `$skip` and `$sort` are working by default. This can be used to narrow down the populated data for, for example:

```js
app.service('users').find({
  query: {},
  $populateParams: {
    query: {
      posts: {
        $select: ["id", "title"]
        comments: {
          $select: ["id", "userId", "createdAt"],
          $sort: {
            createdat: -1
          },
          user:{
            $select: ["id", "nickname"]
          }
        }
      }
    }
  }
})
```

You can also define additional custom query parameter per service. For example if you want to query for posts with `published: true` or comments with `createdAt: { $gt: { 1605971642 } }`. To make this possible you have to `whitelist` these properties per service. `feathers-graph-populate` looks up this array at `service.options.graphPopulate.whitelist`. You can setup this as following:

```js
// posts.service.js
const createService = ...
const createModel = ...
const hooks = ...
const graphPopulate = require('./posts.graph-populate') // containing `populates`, `namedQueries`, `defaultQueryName` and `whitelist`

module.exports = function (app) {
  let Model = createModel(app);
  let paginate = app.get('paginate');

  let options = {
    Model,
    paginate,
    graphPopulate
  };

  /* // alternatively:
    let options = {
      Model,
      paginate,
      graphPopulate: {
        whiteliste: ["published"]
      }
    }
  */

  app.use('/posts', createService(options));
};
```

Now you can perform queries like this:

```js
app.service('users').find({
  query: {},
  $populateParams: {
    query: {
      posts: {
        published: true,
        $select: ["id", "title"]
        comments: {
          $select: ["id"]
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
