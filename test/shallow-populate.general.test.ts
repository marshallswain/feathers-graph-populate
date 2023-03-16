import assert from 'assert'
import { memory } from '@feathersjs/memory'
import sift from 'sift'
import { NotAuthenticated } from '@feathersjs/errors'
import { shallowPopulate as makePopulate } from '../src'
import type { ShallowPopulateOptions } from '../src'
import type { HookContext, Params } from '@feathersjs/feathers'
import { feathers } from '@feathersjs/feathers'

declare module '@feathersjs/feathers' {
  interface Params {
    [key: string]: any
  }
}

async function mockApp() {
  const app = feathers()

  app.use(
    '/posts',
    memory({
      multi: true,
      id: 'id',
    }),
  )

  app.use(
    '/users',
    memory({
      multi: true,
      id: 'id',
    }),
  )

  app.use(
    '/taskSets',
    memory({
      multi: true,
      id: 'id',
    }),
  )

  app.use(
    '/tasks',
    memory({
      multi: true,
      id: 'id',
    }),
  )

  app.use(
    '/comments',
    memory({
      multi: true,
      id: 'id',
    }),
  )

  app.use(
    '/tags',
    memory({
      multi: true,
      id: 'id',
    }),
  )

  app.use(
    '/orgs',
    memory({
      multi: true,
      id: 'id',
    }),
  )

  const postsService = app.service('posts')
  const usersService = app.service('users')
  const taskSetsService = app.service('taskSets')
  const tasksService = app.service('tasks')
  const commentsService = app.service('comments')
  const tagsService = app.service('tags')
  const orgsService = app.service('orgs')

  await postsService.create([
    {
      id: '111',
      name: 'My Monkey and Me',
      userId: '11',
    },
    {
      id: '222',
      name: 'I forgot why I love you',
      userId: '11',
    },
    {
      id: '333',
      name: 'If I were a banana...',
      userId: '22',
    },
    {
      id: 444,
      name: 'One, two, three, one, two, three, drink',
      userId: '33',
    },
    {
      id: 555,
      name: 'Im gonna live like tomorrow doesnt exist',
      userId: 44,
    },
    {
      id: 666,
      name: 'I feel the love, feel the love',
      userId: 44,
    },
  ])

  await usersService.create([
    {
      id: '11',
      name: 'Joe Bloggs',
      postsId: ['111'],
      orgId: 'org1',
    },
    {
      id: '22',
      name: 'Jane Bloggs',
      postsId: '333',
      orgId: 'org2',
    },
    {
      id: '33',
      name: 'John Smith',
      postsId: ['111', '222'],
      orgId: 3,
    },
    {
      id: 44,
      name: 'Muhammad Li',
      postsId: [444, '555'],
      orgId: 4,
    },
  ])

  await taskSetsService.create([
    {
      id: 'ts1',
      name: 'Task Set 1',
    },
    {
      id: 'ts2',
      name: 'Task Set 2',
    },
    {
      id: 'ts3',
      name: 'Task Set 3',
    },
    {
      id: 4,
      name: 'Task Set 4',
    },
    {
      id: 5,
      name: 'Task Set 5',
    },
    {
      id: 'ts6',
      name: 'Task Set 6',
    },
  ])

  await tasksService.create([
    {
      id: 'task1',
      name: 'Task 1 - belongs with TaskSet1',
      taskSet: { taskSetId: 'ts1' },
      userId: '11',
    },
    {
      id: 'task2',
      name: 'Task 2 - belongs with TaskSet2',
      taskSet: { taskSetId: 'ts2' },
      userId: '22',
    },
    {
      id: 'task3',
      name: 'Task 3 - belongs with TaskSet2',
      taskSet: { taskSetId: 'ts2' },
      userId: '11',
    },
    {
      id: 'task4',
      name: 'Task 4 - belongs with TaskSet3',
      taskSet: { taskSetId: 'ts3' },
      userId: 44,
    },
    {
      id: 'task5',
      name: 'Task 5 - belongs with TaskSet3',
      taskSet: { taskSetId: 'ts3' },
      userId: 44,
    },
    {
      id: 'task6',
      name: 'Task 6 - belongs with TaskSet4',
      taskSet: { taskSetId: 'ts3' },
      userId: '33',
    },
    {
      id: 7,
      name: 'Task 7 - belongs with TaskSet4',
      taskSet: { taskSetId: 4 },
    },
    {
      id: 'task8',
      name: 'Task 8 - belongs with TaskSet5',
      taskSet: { taskSetId: 5 },
    },
    {
      id: 9,
      name: 'Task 9 - belongs with TaskSet6',
      taskSet: { taskSetId: 'ts6' },
    },
  ])

  await commentsService.create([
    {
      id: '11111',
      name: 'The Best Sounds This Summer',
      postsId: ['222'],
      userId: '11',
    },
    {
      id: '22222',
      name: 'Chillstation',
      postsId: ['333'],
      userId: '22',
    },
    {
      id: '33333',
      name: 'Hard Hitting Bass',
      postsId: ['111', '222', '333'],
      userId: '33',
    },
    {
      id: 44444,
      name: 'As long as skies are blue',
      postsId: ['111', 444, '555'],
      userId: 44,
    },
  ])

  await tagsService.create([
    {
      id: '1111',
      name: 'Trombones',
      userId: '11',
    },
    {
      id: '2222',
      name: 'Trumpets',
      userId: '11',
    },
    {
      id: '3333',
      name: 'Drums',
      userId: '22',
    },
    {
      id: 4444,
      name: 'Guitars',
      userId: '33',
    },
    {
      id: 5555,
      name: 'Violins',
      userId: 44,
    },
  ])

  await orgsService.create([
    {
      id: 'org1',
      name: 'Southern Utah',
      memberCount: 21,
    },
    {
      id: 'org2',
      name: 'Northern Utah',
      memberCount: 99,
    },
    {
      id: 3,
      name: 'Northern Arizona',
      memberCount: 42,
    },
    {
      id: 4,
      name: 'Southern Arizona',
      memberCount: 23,
    },
  ])

  return app
}

const beforeAfter: [
  { type: 'before'; dataResult: 'data' },
  { type: 'after'; dataResult: 'result' },
] = [
  {
    type: 'before',
    dataResult: 'data',
  },
  {
    type: 'after',
    dataResult: 'result',
  },
]

describe('shallow-populate.general.test.ts', () => {
  let app

  beforeEach(async () => {
    app = await mockApp()
  })

  it('throws when used without an includes object', () => {
    assert.throws(() => {
      //@ts-ignore
      makePopulate()
    }, 'does not work with no includes object')
  })

  it('throws when an includes array has missing properties', () => {
    const includesOptions = [
      {
        include: {},
      },
      {
        include: {
          service: 'posts',
          nameAs: 'posts',
          keyHere: 'postsId',
        },
      },
      {
        include: {
          service: 'posts',
          nameAs: 'posts',
          keyThere: 'id',
        },
      },
      {
        include: {
          service: 'posts',
          nameAs: 'posts',
          keyThere: 'id',
          params: { test: true },
        },
      },
      {
        include: {
          service: 'posts',
          nameAs: 'posts',
          keyHere: 'id',
          params: { test: true },
        },
      },
      {
        include: {
          service: 'posts',
          nameAs: 'posts',
          keyThere: 'id',
          params: () => true,
        },
      },
      {
        include: {
          service: 'posts',
          nameAs: 'posts',
          keyHere: 'id',
          params: () => true,
        },
      },
      {
        include: {
          service: 'posts',
          nameAs: 'posts',
          keyHere: 'id',
          params: {},
        },
      },
      {
        include: {
          service: 'posts',
          nameAs: 'posts',
          keyThere: 'id',
          params: {},
        },
      },
      {
        include: {
          service: 'posts',
          nameAs: 'posts',
          keyThere: 'id',
          requestPerItem: true,
          params: {},
        },
      },
    ]

    includesOptions.forEach((options) => {
      assert.throws(() => {
        //@ts-ignore
        makePopulate(options)
      }, 'Every `include` must contain `service`, `nameAs` and (`keyHere` and `keyThere`) or properties')
    })
  })

  it('throws when an includes array has properties with same `nameAs` property', () => {
    const options = {
      include: [
        {
          service: 'posts',
          nameAs: 'posts',
          keyHere: 'postsId',
          keyThere: 'id',
        },
        {
          service: 'posts',
          nameAs: 'posts',
          keyHere: 'postsId',
          keyThere: 'id',
        },
      ],
    }

    assert.throws(() => {
      makePopulate(options)
    }, 'Every `include` should have unique `nameAs` property')
  })

  it('does nothing if we have no data', async () => {
    for (const { type, dataResult } of beforeAfter) {
      const options: ShallowPopulateOptions = {
        include: {
          // from: 'users',
          service: 'posts',
          nameAs: 'posts',
          keyHere: 'postsId',
          keyThere: 'id',
        },
      }

      const context = {
        app: {
          service(path) {
            return app.service(path)
          },
        },
        method: 'create',
        type,
        params: {},
        [dataResult]: {},
      } as unknown as HookContext

      const shallowPopulate = makePopulate(options)
      const response = await shallowPopulate(context)
      const result = response[dataResult]

      assert.deepStrictEqual(result, context[dataResult], 'data should not be touched')
    }
  })

  it('works with falsy "keyHere: 0" value', async () => {
    for (const { type, dataResult } of beforeAfter) {
      const options = {
        include: {
          // from: 'posts',
          service: 'users',
          nameAs: 'user',
          keyHere: 'id',
          keyThere: 'userId',
        },
      }

      let calledFind = false

      const context = {
        app: {
          service() {
            return {
              find(params: Params) {
                calledFind = true
                assert.deepStrictEqual(
                  params.query?.userId.$in,
                  [0],
                  'sets "userId.$in" accordingly',
                )
              },
            }
          },
        },
        method: 'create',
        type,
        params: {},
        [dataResult]: {
          id: 0,
        },
      } as unknown as HookContext

      const shallowPopulate = makePopulate(options)
      await shallowPopulate(context)

      assert(calledFind, 'called find method')
    }
  })

  describe('requestPerItem: false', () => {
    it('throws if populated request throws', async () => {
      for (const { type, dataResult } of beforeAfter) {
        const options = {
          include: {
            // from: 'users',
            service: 'tasks',
            nameAs: 'tasks',
            keyHere: 'id',
            keyThere: 'userId',
          },
        }
        const context = {
          app: {
            service() {
              return {
                find() {
                  throw new NotAuthenticated('not authenticated')
                },
              }
            },
          },
          method: 'create',
          type,
          params: {},
          [dataResult]: {
            id: '11',
          },
        } as unknown as HookContext

        const shallowPopulate = makePopulate(options)

        await assert.rejects(shallowPopulate(context), 'throws because of lacking authentication')
      }
    })

    it('does not throw if `options.catchOnError: true`', async () => {
      for (const { type, dataResult } of beforeAfter) {
        let reachedThrow = false

        const options: ShallowPopulateOptions = {
          include: [
            {
              // from: 'users',
              service: 'posts',
              nameAs: 'posts',
              keyHere: 'id',
              keyThere: 'userId',
            },
            {
              // from: 'users',
              service: 'posts',
              nameAs: 'post',
              keyHere: 'id',
              keyThere: 'userId',
              asArray: false,
            },
          ],
          catchOnError: true,
        }

        const context = {
          app: {
            service() {
              return {
                find() {
                  reachedThrow = true
                  throw new NotAuthenticated('not authenticated')
                },
              }
            },
          },
          method: 'create',
          type,
          params: {},
          [dataResult]: {
            id: '11',
          },
        } as unknown as HookContext

        const shallowPopulate = makePopulate(options)
        const response = await shallowPopulate(context)
        const { [dataResult]: result } = response

        assert(reachedThrow, 'throw was fired')
        assert(result.posts.length === 0, 'set empty array by default')
        assert.deepStrictEqual(result.post, {}, 'set empty object by default')
      }
    })

    it('does not throw if `include.catchOnError: true`', async () => {
      for (const { type, dataResult } of beforeAfter) {
        let reachedThrow = false

        const options = {
          include: [
            {
              // from: 'users',
              service: 'posts',
              nameAs: 'posts',
              keyHere: 'id',
              keyThere: 'userId',
              catchOnError: true,
            },
            {
              // from: 'users',
              service: 'posts',
              nameAs: 'post',
              keyHere: 'id',
              keyThere: 'userId',
              asArray: false,
              catchOnError: true,
            },
          ],
          catchOnError: false,
        }
        const context = {
          app: {
            service() {
              return {
                find() {
                  reachedThrow = true
                  throw new NotAuthenticated('not authenticated')
                },
              }
            },
          },
          method: 'create',
          type,
          params: {},
          [dataResult]: {
            id: '11',
          },
        } as unknown as HookContext

        const shallowPopulate = makePopulate(options)
        const response = await shallowPopulate(context)
        const { [dataResult]: result } = response

        assert(reachedThrow, 'throw was fired')
        assert(result.posts.length === 0, 'set empty array by default')
        assert.deepStrictEqual(result.post, {}, 'set empty object by default')
      }
    })

    describe('params - requestPerItem: false', () => {
      it('can pass in custom params for lookup', async () => {
        for (const { type, dataResult } of beforeAfter) {
          const options = {
            include: {
              // from: 'users',
              service: 'posts',
              nameAs: 'posts',
              keyHere: 'postsId',
              keyThere: 'id',
              params: { fromCommentsPopulate: true },
            },
          }

          let hasCalledFind = false

          const context = {
            method: 'create',
            type,
            app: {
              service() {
                return {
                  find(params: Params = {}) {
                    assert(params.fromCommentsPopulate === true, 'we have a custom param')
                    hasCalledFind = true
                    return []
                  },
                }
              },
            },
            params: {},
            [dataResult]: {
              id: '1',
            },
          } as unknown as HookContext

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(hasCalledFind, 'checks were made')
        }
      })

      it('can pass in custom params for lookup and merges them deeply', async () => {
        for (const { type, dataResult } of beforeAfter) {
          const options = {
            include: {
              // from: 'users',
              service: 'posts',
              nameAs: 'posts',
              keyHere: 'postsId',
              keyThere: 'id',
              params: { query: { $select: ['id'] } },
            },
          }

          let hasCalledFind = false

          const context = {
            method: 'create',
            type,
            app: {
              service() {
                return {
                  find(params: Params = {}) {
                    assert.deepStrictEqual(
                      params.query?.id.$in,
                      [],
                      'we have the params from shallow-populate',
                    )
                    assert.deepStrictEqual(params.query?.$select, ['id'], 'we have a merged query')
                    hasCalledFind = true
                    return []
                  },
                }
              },
            },
            params: {},
            [dataResult]: {
              id: '1',
            },
          } as unknown as HookContext

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(hasCalledFind, 'checks were made')
        }
      })

      it('can pass in custom params-function which overrides params', async () => {
        for (const { type, dataResult } of beforeAfter) {
          const options = {
            include: {
              // from: 'users',
              service: 'posts',
              nameAs: 'posts',
              keyHere: 'postsId',
              keyThere: 'id',
              params: (params: Params) => {
                assert.deepStrictEqual(
                  params.query?.id.$in,
                  [],
                  'we have the params from shallow-populate first',
                )
                params.query!.$select = ['id']
              },
            },
          }

          let hasCalledFind = false

          const context = {
            method: 'create',
            type,
            app: {
              service() {
                return {
                  find(params: Params) {
                    assert.deepStrictEqual(
                      params.query?.id.$in,
                      [],
                      'we have the params from shallow-populate',
                    )
                    assert.deepStrictEqual(params.query.$select, ['id'], 'we have a merged query')
                    hasCalledFind = true
                    return []
                  },
                }
              },
            },
            params: {},
            [dataResult]: {
              id: '1',
            },
          } as unknown as HookContext

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(hasCalledFind, 'checks were made')
        }
      })

      it('can pass in custom params-function which returns params and merges them deeply', async () => {
        for (const { type, dataResult } of beforeAfter) {
          const options = {
            include: {
              // from: 'users',
              service: 'posts',
              nameAs: 'posts',
              keyHere: 'postsId',
              keyThere: 'id',
              params: () => {
                return { query: { $select: ['id'] } }
              },
            },
          }

          let hasCalledFind = false

          const context = {
            method: 'create',
            type,
            app: {
              service() {
                return {
                  find(params: Params) {
                    assert.deepStrictEqual(
                      params.query?.id.$in,
                      [],
                      'we have the params from shallow-populate',
                    )
                    assert.deepStrictEqual(params.query.$select, ['id'], 'we have a merged query')
                    hasCalledFind = true
                    return []
                  },
                }
              },
            },
            params: {},
            [dataResult]: {
              id: '1',
            },
          } as unknown as HookContext

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(hasCalledFind, 'checks were made')
        }
      })

      it('can pass in custom params-function with context', async () => {
        for (const { type, dataResult } of beforeAfter) {
          let paramsFunctionCalled = false

          const options = {
            include: {
              service: 'posts',
              nameAs: 'posts',
              keyHere: 'postsId',
              keyThere: 'id',
              params: (params, context) => {
                assert(context.method === 'create', 'we can pass the context to include')
                params.method = context.method
                paramsFunctionCalled = true
              },
            },
          }

          let hasCalledFind = false

          const context = {
            method: 'create',
            type,
            app: {
              service() {
                return {
                  find(params: Params) {
                    assert(
                      params.method === 'create',
                      'we can manipulate the params based on the context',
                    )
                    hasCalledFind = true
                    return []
                  },
                }
              },
            },
            params: {},
            [dataResult]: {
              id: '1',
            },
          } as unknown as HookContext

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(paramsFunctionCalled, 'params function was called')
          assert(hasCalledFind, 'checks were made')
        }
      })

      it('calls params-function once even for multiple records', async () => {
        for (const { type, dataResult } of beforeAfter) {
          let calledIncludeUsersParams = false
          let calledIncludeCommentsParams = false

          const options = {
            include: [
              {
                service: 'users',
                nameAs: 'users',
                keyHere: 'id',
                keyThere: 'postsId',
                params: () => {
                  assert(!calledIncludeUsersParams, 'not called before -> only called once')
                  calledIncludeUsersParams = true
                },
              },
              {
                service: 'comments',
                nameAs: 'comments',
                keyHere: 'id',
                keyThere: 'postsId',
                params: () => {
                  assert(!calledIncludeCommentsParams, 'not called before -> only called once')
                  calledIncludeCommentsParams = true
                },
              },
            ],
          }
          const context = {
            app: {
              service(path) {
                return app.service(path)
              },
            },
            method: 'create',
            type,
            params: {},
            [dataResult]: [
              {
                id: '333',
                name: 'If I were a banana...',
              },
              {
                id: '111',
                name: 'My Monkey and Me',
              },
              {
                id: 444,
                name: 'One, two, three, one, two, three, drink',
              },
            ],
          } as unknown as HookContext

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(calledIncludeUsersParams, 'params function for users was called')
          assert(calledIncludeCommentsParams, 'params function for comments was called')
        }
      })

      it('wait for params function that returns a promise', async () => {
        for (const { type, dataResult } of beforeAfter) {
          let calledAsyncFunction = false
          const options = {
            include: {
              service: 'posts',
              nameAs: 'posts',
              params: async (params: Params) => {
                await new Promise((resolve) => {
                  setTimeout(resolve, 200)
                })
                params.calledAsyncFunction = true
                calledAsyncFunction = true
                return params
              },
            },
          }

          let hasCalledFind = false

          const context = {
            method: 'create',
            type,
            app: {
              service() {
                return {
                  find(params: Params) {
                    assert(
                      params.calledAsyncFunction,
                      'waited for async params function before find',
                    )
                    hasCalledFind = true
                    return []
                  },
                }
              },
            },
            params: {},
            [dataResult]: {
              id: '1',
            },
          } as unknown as HookContext

          const shallowPopulate = makePopulate(options)
          await shallowPopulate(context)
          assert(calledAsyncFunction, 'waited for async params function')
          assert(hasCalledFind, 'checks were made')
        }
      })

      it('can pass in params as array', async () => {
        for (const { type, dataResult } of beforeAfter) {
          let calledLastFunction = false

          const expected = {
            paginate: false,
            query: {
              postsId: { $in: ['1'] },
              second: true,
              fourth: true,
            },
            third: true,
            fifth: true,
            sixth: true,
          }

          const options = {
            include: [
              {
                service: 'users',
                nameAs: 'users',
                keyHere: 'id',
                keyThere: 'postsId',
                params: [
                  {},
                  { query: { second: true } },
                  (params) => {
                    assert(params.query.second, 'walked through before')
                    params.third = true
                  },
                  (params) => {
                    assert(params.third, 'walked through before')
                    return { query: { fourth: true } }
                  },
                  async (params) => {
                    assert(params.query.fourth, 'walked through before')
                    await new Promise((resolve) => setTimeout(resolve, 200))
                    params.fifth = true
                  },
                  (params, context) => {
                    assert(params.fifth, 'walked through before')
                    if (context.app) {
                      return { sixth: true }
                    }
                  },
                  (params) => {
                    assert.deepStrictEqual(params, expected, 'params object is right')
                    calledLastFunction = true
                  },
                ],
              },
            ],
          }
          const context = {
            app: {
              service(path) {
                return app.service(path)
              },
            },
            method: 'create',
            type,
            params: {},
            [dataResult]: [
              {
                id: '1',
              },
            ],
          } as unknown as HookContext

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(calledLastFunction, 'all params were called')
        }
      })

      it('params function has third "target" object', async () => {
        for (const { type, dataResult } of beforeAfter) {
          let paramsFunctionCalled = false

          const options = {
            include: {
              service: 'posts',
              nameAs: 'posts',
              keyHere: 'postsId',
              keyThere: 'id',
              params: (params, context, target) => {
                assert.ok(target, 'target is defined')
                assert(
                  target.service && typeof target.service.find === 'function',
                  'target has service',
                )
                assert.strictEqual(typeof target.path, 'string', 'target.path is string')
                params.path = target.path
                paramsFunctionCalled = true
              },
            },
          }

          let hasCalledFind = false

          const context = {
            method: 'create',
            type,
            app: {
              service() {
                return {
                  find(params: Params) {
                    assert.strictEqual(
                      params.path,
                      'posts',
                      'we can manipulate the params based on the target',
                    )
                    hasCalledFind = true
                    return []
                  },
                }
              },
            },
            params: {},
            [dataResult]: {
              id: '1',
            },
          } as unknown as HookContext

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(paramsFunctionCalled, 'params function was called')
          assert(hasCalledFind, 'checks were made')
        }
      })
    })
  })

  describe('requestPerItem: true', () => {
    it('throws if populated request throws', async () => {
      for (const { type, dataResult } of beforeAfter) {
        const options = {
          include: {
            // from: 'users',
            service: 'posts',
            nameAs: 'posts',
            params: { fromCommentsPopulate: true },
          },
        }
        const context = {
          app: {
            service() {
              return {
                find() {
                  throw new NotAuthenticated('not authenticated')
                },
              }
            },
          },
          method: 'create',
          type,
          params: {},
          [dataResult]: {
            id: '11',
          },
        } as unknown as HookContext

        const shallowPopulate = makePopulate(options)

        await assert.rejects(shallowPopulate(context), 'throws because of lacking authentication')
      }
    })

    it('does not throw if `options.catchOnError: true`', async () => {
      let throwReached = false
      for (const { type, dataResult } of beforeAfter) {
        const options = {
          include: [
            {
              // from: 'users',
              service: 'posts',
              nameAs: 'posts',
              params: { fromCommentsPopulate: true },
            },
            {
              // from: 'users',
              service: 'posts',
              nameAs: 'post',
              asArray: false,
              params: { fromCommentsPopulate: true },
            },
          ],
          catchOnError: true,
        }
        const context = {
          app: {
            service() {
              return {
                find() {
                  throwReached = true
                  throw new NotAuthenticated('not authenticated')
                },
              }
            },
          },
          method: 'create',
          type,
          params: {},
          [dataResult]: {
            id: '11',
          },
        } as unknown as HookContext

        const shallowPopulate = makePopulate(options)

        const response = await shallowPopulate(context)
        const { [dataResult]: result } = response

        assert(throwReached, 'throw was fired')
        assert(result.posts.length === 0, 'set empty array by default')
        assert.deepStrictEqual(result.post, {}, 'set empty object by default')
      }
    })

    it('does not throw if `include.catchOnError: true`', async () => {
      let throwReached = false
      for (const { type, dataResult } of beforeAfter) {
        const options = {
          include: [
            {
              // from: 'users',
              service: 'posts',
              nameAs: 'posts',
              params: { fromCommentsPopulate: true },
              catchOnError: true,
            },
            {
              // from: 'users',
              service: 'posts',
              nameAs: 'post',
              asArray: false,
              params: { fromCommentsPopulate: true },
              catchOnError: true,
            },
          ],
          catchOnError: false,
        }
        const context = {
          app: {
            service() {
              return {
                find() {
                  throwReached = true
                  throw new NotAuthenticated('not authenticated')
                },
              }
            },
          },
          method: 'create',
          type,
          params: {},
          [dataResult]: {
            id: '11',
          },
        } as unknown as HookContext

        const shallowPopulate = makePopulate(options)
        const response = await shallowPopulate(context)
        const { [dataResult]: result } = response

        assert(throwReached, 'throw was fired')
        assert(result.posts.length === 0, 'set empty array by default')
        assert.deepStrictEqual(result.post, {}, 'set empty object by default')
      }
    })

    it('can pass in custom params for lookup without `keyHere` and `keyThere`', async () => {
      for (const { type, dataResult } of beforeAfter) {
        const options = {
          include: {
            // from: 'users',
            service: 'posts',
            nameAs: 'posts',
            params: { fromCommentsPopulate: true },
          },
        }

        let hasCalledFind = false

        const context = {
          method: 'create',
          type,
          app: {
            service() {
              return {
                find(params: Params) {
                  assert(params.fromCommentsPopulate === true, 'we have a custom param')
                  hasCalledFind = true
                  return []
                },
              }
            },
          },
          params: {},
          [dataResult]: {
            id: '1',
          },
        } as unknown as HookContext

        const shallowPopulate = makePopulate(options)

        await shallowPopulate(context)
        assert(hasCalledFind, 'checks were made')
      }
    })

    it('can pass in custom params function without `keyThere` and ``keyHere`', () => {
      const expected = { paginate: false }
      const options = {
        include: {
          service: 'posts',
          nameAs: 'posts',
          params: (params: Params) => {
            assert.deepStrictEqual(params, expected, 'params just have paginate attribute')
            return params
          },
        },
      }

      assert.doesNotThrow(() => {
        makePopulate(options)
      }, 'does not throw error')
    })

    it('can pass params as nonempty object without `keyThere` and ``keyHere`', () => {
      const options = {
        include: {
          service: 'posts',
          nameAs: 'posts',
          params: {
            test: true,
          },
        },
      }

      assert.doesNotThrow(() => {
        makePopulate(options)
      }, 'does not throw error')
    })

    it('skip request if params returns undefined', async () => {
      for (const { type, dataResult } of beforeAfter) {
        const options = {
          include: {
            // from: 'users',
            service: 'posts',
            nameAs: 'posts',
            params: () => {},
          },
        }

        let hasCalledFind = false

        const context = {
          method: 'create',
          type,
          app: {
            service() {
              return {
                find() {
                  hasCalledFind = true
                  return []
                },
              }
            },
          },
          params: {},
          [dataResult]: {
            id: '1',
          },
        } as unknown as HookContext

        const shallowPopulate = makePopulate(options)

        await shallowPopulate(context)
        assert(!hasCalledFind, 'skip request if params function returns undefined')
      }
    })

    it('can pass in custom params-function which overrides params', async () => {
      for (const { type, dataResult } of beforeAfter) {
        const options = {
          include: {
            // from: 'users',
            service: 'posts',
            nameAs: 'posts',
            params: (params: Params) => {
              params.query = { id: 1 }
              return params
            },
          },
        }

        let hasCalledFind = false

        const context = {
          method: 'create',
          type,
          app: {
            service() {
              return {
                find(params: Params) {
                  assert(params.paginate === false, 'we have the params from shallow-populate')
                  assert(params.query?.id === 1, 'we have a merged query')
                  hasCalledFind = true
                  return []
                },
              }
            },
          },
          params: {},
          [dataResult]: {
            id: '1',
          },
        } as unknown as HookContext

        const shallowPopulate = makePopulate(options)

        await shallowPopulate(context)
        assert(hasCalledFind, 'checks were made')
      }
    })

    it('can pass in custom params-function which returns params and merges them deeply', async () => {
      for (const { type, dataResult } of beforeAfter) {
        const options = {
          include: {
            // from: 'users',
            service: 'posts',
            nameAs: 'posts',
            params: () => {
              return { query: { $select: ['id'] } }
            },
          },
        }

        let hasCalledFind = false

        const context = {
          method: 'create',
          type,
          app: {
            service() {
              return {
                find(params: Params) {
                  assert(params.paginate === false, 'we have the params from shallow-populate')
                  assert.deepStrictEqual(
                    params.query,
                    { $select: ['id'] },
                    'we have a merged query',
                  )
                  hasCalledFind = true
                  return []
                },
              }
            },
          },
          params: {},
          [dataResult]: {
            id: '1',
          },
        } as unknown as HookContext

        const shallowPopulate = makePopulate(options)

        await shallowPopulate(context)
        assert(hasCalledFind, 'checks were made')
      }
    })

    it('can pass in custom params-function with context', async () => {
      for (const { type, dataResult } of beforeAfter) {
        let paramsFunctionCalled = false

        const options = {
          include: {
            service: 'posts',
            nameAs: 'posts',
            params: (params: Params, context: HookContext) => {
              assert.strictEqual(context.method, 'create', 'we can pass the context to include')
              params.method = context.method
              paramsFunctionCalled = true
              return params
            },
          },
        }

        let hasCalledFind = false

        const context = {
          method: 'create',
          type,
          app: {
            service() {
              return {
                find(params: Params) {
                  assert.strictEqual(
                    params.method,
                    'create',
                    'we can manipulate the params based on the context',
                  )
                  hasCalledFind = true
                  return []
                },
              }
            },
          },
          params: {},
          [dataResult]: {
            id: '1',
          },
        } as unknown as HookContext

        const shallowPopulate = makePopulate(options)

        await shallowPopulate(context)
        assert(paramsFunctionCalled, 'params function was called')
        assert(hasCalledFind, 'checks were made')
      }
    })

    it('access `this` keyword in custom params-function which matches the data item', async () => {
      for (const { type, dataResult } of beforeAfter) {
        let paramsFunctionCalled = false

        const item = {
          id: '11',
          name: 'Dumb Stuff',
          meta: {
            postsId: ['111', '222', '333', 444, 555, '666'],
          },
        }

        const options = {
          include: {
            service: 'posts',
            nameAs: 'posts',
            params: function (params, context) {
              assert.deepStrictEqual(this, item, 'item from data is passed as `this` keyword')
              assert.strictEqual(context.method, 'create', 'we can pass the context to include')
              params.method = context.method
              paramsFunctionCalled = true
              return params
            },
          },
        }

        let hasCalledFind = false
        const context = {
          method: 'create',
          type,
          app: {
            service() {
              return {
                find(params: Params) {
                  assert(
                    params.method === 'create',
                    'we can manipulate the params based on the context',
                  )
                  hasCalledFind = true
                  return []
                },
              }
            },
          },
          params: {},
          [dataResult]: item,
        } as unknown as HookContext

        const shallowPopulate = makePopulate(options)

        await shallowPopulate(context)
        assert(paramsFunctionCalled, 'params function was called')
        assert(hasCalledFind, 'checks were made')
      }
    })

    it('calls params-function per include and item', async () => {
      for (const { type, dataResult } of beforeAfter) {
        const items = [
          {
            id: '333',
            name: 'If I were a banana...',
          },
          {
            id: '111',
            name: 'My Monkey and Me',
          },
          {
            id: 444,
            name: 'One, two, three, one, two, three, drink',
          },
        ]

        let calledUsersParamsNTimes = 0
        let calledCommentsParamsNTimes = 0

        const options = {
          include: [
            {
              service: 'users',
              nameAs: 'users',
              params: () => {
                calledUsersParamsNTimes++
                return {}
              },
            },
            {
              service: 'comments',
              nameAs: 'comments',
              params: () => {
                calledCommentsParamsNTimes++
                return {}
              },
            },
          ],
        }
        const context = {
          app: {
            service(path) {
              return app.service(path)
            },
          },
          method: 'create',
          type,
          params: {},
          [dataResult]: items,
        } as unknown as HookContext

        const shallowPopulate = makePopulate(options)

        await shallowPopulate(context)
        assert(
          calledUsersParamsNTimes === items.length,
          'params function for users was called n times',
        )
        assert(
          calledCommentsParamsNTimes === items.length,
          'params function for comments was called n times',
        )
      }
    })

    it('wait for params function that returns a promise', async () => {
      for (const { type, dataResult } of beforeAfter) {
        let calledAsyncFunction = false
        const options = {
          include: {
            service: 'posts',
            nameAs: 'posts',
            params: async (params) => {
              await new Promise((resolve) => {
                setTimeout(resolve, 200)
              })
              params.calledAsyncFunction = true
              calledAsyncFunction = true
              return params
            },
          },
        }

        let hasCalledFind = false

        const context = {
          method: 'create',
          type,
          app: {
            service() {
              return {
                find(params: Params) {
                  assert(params.calledAsyncFunction, 'waited for async params function before find')
                  hasCalledFind = true
                  return []
                },
              }
            },
          },
          params: {},
          [dataResult]: {
            id: '1',
          },
        } as unknown as HookContext

        const shallowPopulate = makePopulate(options)
        await shallowPopulate(context)
        assert(calledAsyncFunction, 'waited for async params function')
        assert(hasCalledFind, 'checks were made')
      }
    })

    it('can define params as array', async () => {
      for (const { type, dataResult } of beforeAfter) {
        let calledLastFunction = false

        const expected = {
          paginate: false,
          query: {
            second: true,
            fourth: true,
          },
          third: true,
          fifth: true,
          sixth: true,
        }

        const options = {
          include: [
            {
              service: 'users',
              nameAs: 'users',
              params: [
                {},
                { query: { second: true } },
                (params) => {
                  assert(params.query.second, 'walked through before')
                  params.third = true
                  return params
                },
                (params) => {
                  assert(params.third, 'walked through before')
                  return { query: { fourth: true } }
                },
                async (params) => {
                  assert(params.query.fourth, 'walked through before')
                  await new Promise((resolve) => setTimeout(resolve, 200))
                  params.fifth = true
                  return params
                },
                (params, context) => {
                  assert(params.fifth, 'walked through before')
                  if (context.app) {
                    return { sixth: true }
                  }
                },
                (params) => {
                  assert.deepStrictEqual(params, expected, 'params object is right')
                  calledLastFunction = true
                  return params
                },
              ],
            },
          ],
        }
        const context = {
          app: {
            service(path) {
              return app.service(path)
            },
          },
          method: 'create',
          type,
          params: {},
          [dataResult]: [
            {
              id: '1',
            },
          ],
        } as unknown as HookContext

        const shallowPopulate = makePopulate(options)

        await shallowPopulate(context)
        assert(calledLastFunction, 'all params were called')
      }
    })

    it('params function has third "target" object', async () => {
      for (const { type, dataResult } of beforeAfter) {
        let paramsFunctionCalled = false

        const options = {
          include: {
            service: 'posts',
            nameAs: 'posts',
            params: (params, context, target) => {
              assert.ok(target, 'target is defined')
              assert(
                target.service && typeof target.service.find === 'function',
                'target has service',
              )
              assert.strictEqual(typeof target.path, 'string', 'target.path is string')
              params.path = target.path
              paramsFunctionCalled = true
              return params
            },
          },
        }

        let hasCalledFind = false

        const context = {
          method: 'create',
          type,
          app: {
            service() {
              return {
                find(params: Params) {
                  assert.strictEqual(
                    params.path,
                    'posts',
                    'we can manipulate the params based on the target',
                  )
                  hasCalledFind = true
                  return []
                },
              }
            },
          },
          params: {},
          [dataResult]: {
            id: '1',
          },
        } as unknown as HookContext

        const shallowPopulate = makePopulate(options)

        await shallowPopulate(context)
        assert(paramsFunctionCalled, 'params function was called')
        assert(hasCalledFind, 'checks were made')
      }
    })
  })
})
