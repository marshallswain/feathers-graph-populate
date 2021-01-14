---
title: graph-populate hooks
sidebarDepth: 3
---

## Introduction

`feathers-graph-populate` allows to pass custom `params` to your `populates` objects. It's possible to pass a function or an array of objects and functions. If you use `feathers-graph-populate` throughout your app, chances are, that you have lots of `populates` objects. Imagine you want to pass the `user` from the initial service request to each `populates` down. You could use the following:

```js
const populates = {
  posts: {
    service: 'posts',
    nameAs: 'posts',
    keyHere: '_id',
    keyThere: 'authorId',
    asArray: true,
    params: (params, context) => {
      if (context.params && context.params.user) {
        params.user = context.params.user
      }
    }
  }
}
```

But what if you want to use this in every of your various `populates`? `feathers-graph-populate` got you covered! You can define **graph-populate hooks** pretty similar to defining native **hooks** of `@feathersjs/feathers`. You can define **app wide hooks**, that will be used in every single `populates` and also **service hooks** for every service. After setting up **app wide hooks** the example from is as simple as the following:

```js
// src/app.js

const graphPopulate = require('feathers-graph-populate')
const graphPopulateHooks = require('./graph-populate.hooks.js')
app.configure(graphPopulate())
app.graphPopulate.hooks({
  before: {
    all: [
      (params, context) => {
        if (context.params && context.params.user) {
          params.user = context.params.user
        }
      }
    ]
  }
})
```

If you want the full setup continue reading.

## Setup

#### App

You can enable **app wide hooks** with the following setup:

```js
// src/app.js
const graphPopulate = require('feathers-graph-populate')
const graphPopulateHooks = require('./graph-populate.hooks.js')
app.configure(graphPopulate()) // this line is also needed for graph-populate servide hooks
app.graphPopulate.hooks(graphPopulateHooks)
```

```js
// src/graph-populate.hooks.js

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  }
};

```

#### Per service

After configuring `feathers-graph-populate` in `src/app.js` you can define **service hooks** for each service individually.

```js
// src/services/users/users.service.js

// Initializes the `users` service on path `/users`.
const createService = require('feathers-nedb');
const createModel = require('../../models/users.model');
const hooks = require('./users.hooks');
// ^1
const graphPopulateHooks = require('./users.graph-populate-hooks.js')

module.exports = function (app) {
  let Model = createModel(app);
  let paginate = app.get('paginate');

  let options = {
    Model,
    paginate
  };

  app.use('/users', createService(options));

  const service = app.service('users');

  service.hooks(hooks);
  // ^2
  service.graphPopulate.hooks(graphPopulateHooks);
};
```
with:
```js
// src/services/users/users.graph-populate-hooks.js

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  }
};

```

## Concepts

### Possible values for hooks

**graph-populate hooks** are exactly the same as the `params` property in `populates`. So you can define:
1. a `params` object, that gets merged
2. a `params` function: `(params, context, target) => params`
3. an async `params` function: `(params, context, target) => Promise<params>`

#### What are the parameters of a hook-function?

- `params`: is the predefined object from `feathers-graph-populate` that will be used to *find* the items to populate
- `context`: is the *context* of the source request! If you change it, it will lead in unexpected behaviour after your population is done. You mostly just want to use it to put something from `context.params` to `params`.
- `target ({ service, path })`: can be helpful, if you use an **app wide hook** and you need to know which service will be called with the current request. The `context` tells you, where the request comes from and the `target` tells you, where it will be passed to. It's helpful for example if you need a conditional hook based on the target service.
