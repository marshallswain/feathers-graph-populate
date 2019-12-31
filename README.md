# @ionomy/deep-populate

> Project @ionomy/deep-populate

## About

This project uses [FeathersJS](http://feathersjs.com). An open source web framework for building modern real-time applications.

## Getting Started

### Define your relationships

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
const { populate } = require('feathers-deep-populate')

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
const { paramsForServer } = require('feathers-deep-populate')

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
const { paramsFromClient } = require('feathers-deep-populate')

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

## Scaffolding

Feathers-plus has a powerful command line interface. Here are a few things it can do:

```
$ npm install -g @feathers-plus/cli          # Install Feathers-plus CLI

$ feathers-plus generate options             # Specify options for this app
$ feathers-plus generate app                 # Generate scaffolding for app
$ feathers generate authentication           # Generate authentication and user-entity service
$ feathers-plus generate secret              # Generate a new secret for authentication
$ feathers-plus generate service             # Generate a new service with its model
$ feathers-plus generate graphql             # Generate a GraphQL endpoint for services
$ feathers-plus generate all                 # Regenerate the entire app
$ feathers-plus help                         # Show all commands
```

## Help

For more information on all the things you can do, visit [the generator](https://generator.feathers-plus.com/), [FeathersJS](http://docs.feathersjs.com) and [extensions](https://feathers-plus.github.io/).

## Changelog

__0.1.0__

- Initial release

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
