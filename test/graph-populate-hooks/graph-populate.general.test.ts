import assert from 'assert'
import type { Params } from '@feathersjs/feathers'
import { feathers } from '@feathersjs/feathers'
import { MemoryService } from '@feathersjs/memory'

import configureGraphPopulate, { populate } from '../../src'

type GraphPopulateParams = Params & { $populateParams: any; test: any }

const mockApp = () => {
  const app = feathers<{
    users: MemoryService<any, any, GraphPopulateParams> & { graphPopulate: any }
    companies: MemoryService<any, any, GraphPopulateParams> & { graphPopulate: any }
    posts: MemoryService<any, any, GraphPopulateParams> & { graphPopulate: any }
  }>()
  app.configure(configureGraphPopulate())

  app.use('users', new MemoryService({ multi: true, startId: 1 }) as any)
  app.use('companies', new MemoryService({ multi: true, startId: 1 }) as any)
  app.use('posts', new MemoryService({ multi: true, startId: 1 }) as any)

  const usersService = app.service('users')

  usersService.hooks({
    after: {
      all: [
        populate({
          populates: {
            company: {
              service: 'companies',
              nameAs: 'company',
              keyHere: 'companyId',
              keyThere: 'id',
              asArray: false,
            },
            posts: {
              service: 'posts',
              nameAs: 'posts',
              keyHere: 'id',
              keyThere: 'userId',
              asArray: true,
            },
          },
          namedQueries: {
            complete: {
              company: {
                users: {},
              },
              posts: {},
            },
          },
        }),
      ],
    },
  })

  const companiesService = app.service('companies')

  companiesService.hooks({
    after: {
      all: [
        populate({
          populates: {
            users: {
              service: 'users',
              nameAs: 'users',
              keyHere: 'id',
              keyThere: 'companyId',
              asArray: true,
            },
          },
          namedQueries: {
            complete: {
              users: {},
            },
          },
        }),
      ],
    },
  })
  const postsService = app.service('posts')

  return {
    app,
    usersService,
    companiesService,
    postsService,
  }
}

describe('graph-populate.general.test.ts', () => {
  it('initializes graph-populate with app.configure', () => {
    const { app, usersService, companiesService, postsService } = mockApp()

    const graphPopulateApp = app.graphPopulate

    assert.ok(graphPopulateApp, 'app has graphPopulateApp')
    assert.ok(graphPopulateApp.__hooks, 'app has __hooks')
    assert.strictEqual(typeof graphPopulateApp.hooks, 'function', 'app has hooks-function')

    assert.ok(usersService.graphPopulate, 'usersService has graphPopulate')
    assert.ok(usersService.graphPopulate.__hooks, 'usersService.graphPopulate has __hooks')
    assert.strictEqual(
      typeof usersService.graphPopulate.hooks,
      'function',
      'usersService.graphPopulate has hooks-function',
    )

    assert.ok(companiesService.graphPopulate, 'companiesService has graphPopulate')
    assert.ok(companiesService.graphPopulate.__hooks, 'companiesService.graphPopulate has __hooks')
    assert.strictEqual(
      typeof companiesService.graphPopulate.hooks,
      'function',
      'companiesService.graphPopulate has hooks-function',
    )

    assert.ok(postsService.graphPopulate, 'postsService has graphPopulate')
    assert.ok(postsService.graphPopulate.__hooks, 'postsService.graphPopulate has __hooks')
    assert.strictEqual(
      typeof postsService.graphPopulate.hooks,
      'function',
      'postsService.graphPopulate has hooks-function',
    )
  })

  it('app has two hooks for each type and method', () => {
    const { app } = mockApp()

    const graphPopulateApp = app.graphPopulate

    graphPopulateApp.hooks({
      before: {
        all: [() => {}],
        find: [() => {}],
        get: [() => {}],
        create: [() => {}],
        update: [() => {}],
        patch: [() => {}],
        remove: [() => {}],
      },
      after: {
        all: [() => {}],
        find: [() => {}],
        get: [() => {}],
        create: [() => {}],
        update: [() => {}],
        patch: [() => {}],
        remove: [() => {}],
      },
    })

    const types = ['before', 'after']
    const methods = ['find', 'get', 'create', 'update', 'patch', 'remove']

    types.forEach((type) => {
      methods.forEach((method) => {
        assert.strictEqual(
          graphPopulateApp.__hooks[type][method].length,
          2,
          `'${type}:${method} has two hooks`,
        )
      })
    })
  })

  it('service has two hooks for each type and method', () => {
    const { usersService } = mockApp()

    usersService.graphPopulate.hooks({
      before: {
        all: [() => {}],
        find: [() => {}],
        get: [() => {}],
        create: [() => {}],
        update: [() => {}],
        patch: [() => {}],
        remove: [() => {}],
      },
      after: {
        all: [() => {}],
        find: [() => {}],
        get: [() => {}],
        create: [() => {}],
        update: [() => {}],
        patch: [() => {}],
        remove: [() => {}],
      },
    })

    const types = ['before', 'after']
    const methods = ['find', 'get', 'create', 'update', 'patch', 'remove']

    types.forEach((type) => {
      methods.forEach((method) => {
        assert.strictEqual(
          usersService.graphPopulate.__hooks[type][method].length,
          2,
          `'${type}:${method} has two hooks`,
        )
      })
    })
  })

  it('has right hooks order before(app:all, app:method, service:all, service:method) after(service:all, service:method, app:all, app:method)', async () => {
    const { app, usersService, postsService } = mockApp()

    const graphPopulateApp = app.graphPopulate

    const calledAppAfterAll = {}

    graphPopulateApp.hooks({
      before: {
        all: [
          (params) => {
            assert(!params.count, '"app:before:all": count not set')
            params.count = 1
          },
        ],
        find: [
          (params) => {
            assert.strictEqual(params.count, 1, '"app:before:find": run app:all before')
            params.count++
          },
        ],
        get: [
          (params) => {
            assert.strictEqual(params.count, 1, '"app:before:get": run app:all before')
            params.count++
          },
        ],
        create: [
          (params) => {
            assert.strictEqual(params.count, 1, '"app:before:create": run app:all before')
            params.count++
          },
        ],
        update: [
          (params) => {
            assert.strictEqual(params.count, 1, '"app:before:update": run app:all before')
            params.count++
          },
        ],
        patch: [
          (params) => {
            assert.strictEqual(params.count, 1, '"app:before:patch": run app:all before')
            params.count++
          },
        ],
        remove: [
          (params) => {
            assert.strictEqual(params.count, 1, '"app:before:remove": run app:all before')
            params.count++
          },
        ],
      },
      after: {
        all: [
          (params, context) => {
            assert.strictEqual(
              params.count,
              6,
              '"app:after:all": run all four before & after:method',
            )
            params.count++
            calledAppAfterAll[context.method] = true
          },
        ],
        find: [
          (params) => {
            assert.strictEqual(params.count, 7, '"app:after:find": run all hooks')
            params.count++
          },
        ],
        get: [
          (params) => {
            assert.strictEqual(params.count, 7, '"app:after:get": run all hooks')
            params.count++
          },
        ],
        create: [
          (params) => {
            assert.strictEqual(params.count, 7, '"app:after:create": run all hooks')
            params.count++
          },
        ],
        update: [
          (params) => {
            assert.strictEqual(params.count, 7, '"app:after:update": run all hooks')
            params.count++
          },
        ],
        patch: [
          (params) => {
            assert.strictEqual(params.count, 7, '"app:after:patch": run all hooks')
            params.count++
          },
        ],
        remove: [
          (params) => {
            assert.strictEqual(params.count, 7, '"app:after:remove": run all hooks')
            params.count++
          },
        ],
      },
    })

    postsService.graphPopulate.hooks({
      before: {
        all: [
          (params) => {
            assert.strictEqual(
              params.count,
              2,
              '"service:before:all": run app:all&app:method before',
            )
            params.count++
          },
        ],
        find: [
          (params) => {
            assert.strictEqual(
              params.count,
              3,
              '"service:before:find": run app:all,app:method&service:all before',
            )
            params.count++
          },
        ],
        get: [
          (params) => {
            assert.strictEqual(
              params.count,
              3,
              '"service:before:get": run app:all,app:method&service:all before',
            )
            params.count++
          },
        ],
        create: [
          (params) => {
            assert.strictEqual(
              params.count,
              3,
              '"service:before:create": run app:all,app:method&service:all before',
            )
            params.count++
          },
        ],
        update: [
          (params) => {
            assert.strictEqual(
              params.count,
              3,
              '"service:before:update": run app:all,app:method&service:all before',
            )
            params.count++
          },
        ],
        patch: [
          (params) => {
            assert.strictEqual(
              params.count,
              3,
              '"service:before:patch": run app:all,app:method&service:all before',
            )
            params.count++
          },
        ],
        remove: [
          (params) => {
            assert.strictEqual(
              params.count,
              3,
              '"service:before:remove": run app:all,app:method&service:all before',
            )
            params.count++
          },
        ],
      },
      after: {
        all: [
          (params) => {
            assert.strictEqual(params.count, 4, '"service:after:all": run all four before')
            params.count++
          },
        ],
        find: [
          (params) => {
            assert.strictEqual(
              params.count,
              5,
              '"service:after:find": run all four before & after:all',
            )
            params.count++
          },
        ],
        get: [
          (params) => {
            assert.strictEqual(
              params.count,
              5,
              '"service:after:get": run all four before & after:all',
            )
            params.count++
          },
        ],
        create: [
          (params) => {
            assert.strictEqual(
              params.count,
              5,
              '"service:after:create": run all four before & after:all',
            )
            params.count++
          },
        ],
        update: [
          (params) => {
            assert.strictEqual(
              params.count,
              5,
              '"service:after:update": run all four before & after:all',
            )
            params.count++
          },
        ],
        patch: [
          (params) => {
            assert.strictEqual(
              params.count,
              5,
              '"service:after:patch": run all four before & after:all',
            )
            params.count++
          },
        ],
        remove: [
          (params) => {
            assert.strictEqual(
              params.count,
              5,
              '"service:after:remove": run all four before & after:all',
            )
            params.count++
          },
        ],
      },
    })

    const params = { $populateParams: { query: { posts: {} } } }

    const methods = {
      create: [{ id: 1, test: true }, params],
      find: [params],
      get: [1, params],
      update: [1, { test: true }, params],
      patch: [1, { test: true }, params],
      remove: [1, params],
    }

    await Promise.all(
      Object.keys(methods).map(async (method) => {
        await usersService[method](...methods[method])
        assert.strictEqual(calledAppAfterAll[method], true, `called all hooks for '${method}'`)
      }),
    )
  })

  it('app hooks work with "all"-objects for app and service', async () => {
    const { app, usersService, companiesService, postsService } = mockApp()

    const graphPopulateApp = app.graphPopulate

    const company = await companiesService.create({ name: 'company' })
    const user = await usersService.create({ companyId: company.id })
    await postsService.create([{ userId: user.id }, { userId: user.id }])

    let companiesAfterCalledI = 0
    let postsAfterCalledI = 0
    let usersAfterCalledI = 0

    companiesService.hooks({
      after: {
        all: [
          (context) => {
            assert(companiesAfterCalledI === 0, 'companiesService not called before')
            companiesAfterCalledI++
            assert(context.params.test === true, 'params.test was set')
            assert(context.params['before:all'] === true, '"before:all" was called')
            assert(context.params['after:all'] === true, '"after:all" was called')
          },
        ],
      },
    })

    postsService.hooks({
      after: {
        all: [
          (context) => {
            assert(postsAfterCalledI === 0, 'companiesService not called before')
            postsAfterCalledI++
            assert(context.params.test === true, 'params.test was set')
            assert(context.params['before:all'] === true, '"before:all" was called')
            assert(context.params['after:all'] === true, '"after:all" was called')
          },
        ],
      },
    })

    usersService.hooks({
      after: {
        find: [
          (context) => {
            assert(usersAfterCalledI < 2, 'usersService just called twice')
            usersAfterCalledI++
            assert(context.params.test === true, 'params.test was set')
            if (usersAfterCalledI === 1) {
              assert(context.params['before:all'] === true, '"before:all" was called')
              assert(context.params['after:all'] === true, '"after:all" was called')
            }
          },
        ],
      },
    })

    let calledAfter = 0

    graphPopulateApp.hooks({
      before: {
        all: [
          {
            test: true,
            'before:all': true,
          },
        ],
      },
      after: {
        all: [
          function (params) {
            calledAfter++
            assert(params.test === true, 'passed from "before:all" to "after:all"')
            params['after:all'] = true
          },
        ],
      },
    })

    const [result] = (await usersService.find({
      query: {},
      test: true,
      $populateParams: {
        name: 'complete',
      },
    })) as any

    const expected = {
      id: 1,
      companyId: 1,
      company: {
        id: 1,
        name: 'company',
        users: [{ id: 1, companyId: 1 }],
      },
      posts: [
        { id: 1, userId: 1 },
        { id: 2, userId: 1 },
      ],
    }

    assert.strictEqual(calledAfter, 3, 'called "after:all" 3 times')
    assert(companiesAfterCalledI === 1, 'called companiesService after hook')
    assert(postsAfterCalledI === 1, 'called postsService after hook')
    assert(usersAfterCalledI === 2, 'called usersService after hook twice')
    assert.deepStrictEqual(result, expected, 'populated correctly')
  })

  it('app hooks work with "all"-functions for app and service', async () => {
    const { app, usersService, companiesService, postsService } = mockApp()

    const graphPopulateApp = app.graphPopulate

    const company = await companiesService.create({ name: 'company' })
    const user = await usersService.create({ companyId: company.id })
    await postsService.create([{ userId: user.id }, { userId: user.id }])

    let companiesAfterCalledI = 0
    let postsAfterCalledI = 0
    let usersAfterCalledI = 0

    companiesService.hooks({
      after: {
        all: [
          (context) => {
            assert(companiesAfterCalledI === 0, 'companiesService not called before')
            companiesAfterCalledI++
            assert(context.params.test === true, 'params.test was set')
            assert(context.params['before:all'] === true, '"before:all" was called')
            assert(context.params['after:all'] === true, '"after:all" was called')
          },
        ],
      },
    })

    postsService.hooks({
      after: {
        all: [
          (context) => {
            assert(postsAfterCalledI === 0, 'companiesService not called before')
            postsAfterCalledI++
            assert(context.params.test === true, 'params.test was set')
            assert(context.params['before:all'] === true, '"before:all" was called')
            assert(context.params['after:all'] === true, '"after:all" was called')
          },
        ],
      },
    })

    usersService.hooks({
      after: {
        find: [
          (context) => {
            assert(usersAfterCalledI < 2, 'usersService just called twice')
            usersAfterCalledI++
            assert(context.params.test === true, 'params.test was set')
            if (usersAfterCalledI === 1) {
              assert(context.params['before:all'] === true, '"before:all" was called')
              assert(context.params['after:all'] === true, '"after:all" was called')
            }
          },
        ],
      },
    })

    let calledBefore = 0
    let calledAfter = 0

    graphPopulateApp.hooks({
      before: {
        all: [
          function (params, context) {
            calledBefore++
            if (context.params?.test !== undefined) {
              params.test = context.params.test
            }
            params['before:all'] = true
          },
        ],
      },
      after: {
        all: [
          function (params) {
            calledAfter++
            assert(params.test === true, 'passed from "before:all" to "after:all"')
            params['after:all'] = true
          },
        ],
      },
    })

    const [result] = (await usersService.find({
      query: {},
      test: true,
      $populateParams: {
        name: 'complete',
      },
    })) as any

    const expected = {
      id: 1,
      companyId: 1,
      company: {
        id: 1,
        name: 'company',
        users: [{ id: 1, companyId: 1 }],
      },
      posts: [
        { id: 1, userId: 1 },
        { id: 2, userId: 1 },
      ],
    }

    assert.strictEqual(calledBefore, 3, 'called "before:all" 3 times')
    assert.strictEqual(calledAfter, 3, 'called "after:all" 3 times')
    assert(companiesAfterCalledI === 1, 'called companiesService after hook')
    assert(postsAfterCalledI === 1, 'called postsService after hook')
    assert(usersAfterCalledI === 2, 'called usersService after hook twice')
    assert.deepStrictEqual(result, expected, 'populated correctly')
  })
})
