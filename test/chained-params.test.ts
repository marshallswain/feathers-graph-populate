import assert from 'node:assert'
import type { Params } from '@feathersjs/feathers'
import { feathers } from '@feathersjs/feathers'
import { MemoryService } from '@feathersjs/memory'

import configureGraphPopulate, { populate } from '../src/index.js'
import { chainedParams } from '../src/utils/shallow-populate.utils.js'

const context = {} as any
const target = {}

describe('chainedParams', () => {
  it('merges non-conflicting query properties flat', async () => {
    const params = await chainedParams(
      [
        { query: { userId: { $in: [1, 2] } }, paginate: false } as Params,
        { query: { published: true } },
      ],
      context,
      target,
    )

    assert.deepStrictEqual(params, {
      query: { userId: { $in: [1, 2] }, published: true },
      paginate: false,
    })
  })

  it('does not let later params override a query property', async () => {
    const params = await chainedParams(
      [{ query: { deleted: false } }, { query: { deleted: true } }],
      context,
      target,
    )

    assert.deepStrictEqual(params?.query, {
      $and: [{ deleted: false }, { deleted: true }],
    })
  })

  it('intersects $select', async () => {
    const narrowed = await chainedParams(
      [{ query: { $select: ['a', 'b', 'c'] } }, { query: { $select: ['a'] } }],
      context,
      target,
    )
    const disjoint = await chainedParams(
      [{ query: { $select: ['a', 'b', 'c'] } }, { query: { $select: ['x'] } }],
      context,
      target,
    )

    assert.deepStrictEqual(narrowed?.query, { $select: ['a'] })
    assert.deepStrictEqual(disjoint?.query, { $select: [] })
  })

  it('takes $limit and $skip from later params and combines $sort', async () => {
    const params = await chainedParams(
      [
        { query: { $limit: 10, $skip: 1, $sort: { a: 1 } } },
        { query: { $limit: 2, $sort: { b: -1 } } },
      ],
      context,
      target,
    )

    assert.deepStrictEqual(params?.query, {
      $limit: 2,
      $skip: 1,
      $sort: { a: 1, b: -1 },
    })
  })

  it('merges params other than query shallowly', async () => {
    class Transaction {}
    const transaction = new Transaction()

    const params = await chainedParams(
      [
        { provider: 'rest', user: { id: 1, roles: ['admin'] } },
        { transaction, user: { name: 'Jane' } },
      ],
      context,
      target,
    )

    assert.deepStrictEqual(params, {
      provider: 'rest',
      user: { name: 'Jane' },
      transaction,
    })
    assert.strictEqual(params?.transaction, transaction)
  })

  it('does not mutate the passed params', async () => {
    const staticParams = { query: { published: true } }

    await chainedParams(
      [
        staticParams,
        (params: Params) => {
          params.query!.userId = 1
          return params
        },
      ],
      context,
      target,
    )

    assert.deepStrictEqual(staticParams, { query: { published: true } })
  })
})

describe('populate: client query cannot widen the populate params', () => {
  it('keeps query restrictions and $select of the populate params', async () => {
    const app = feathers<{ users: MemoryService; posts: MemoryService }>()
    app.configure(configureGraphPopulate())
    app.use('users', new MemoryService({ multi: true, startId: 1 }))
    app.use(
      'posts',
      new MemoryService({
        multi: true,
        startId: 1,
        graphPopulate: { whitelist: ['published'] },
      } as any),
    )

    const users = app.service('users')
    const posts = app.service('posts')

    users.hooks({
      after: {
        all: [
          populate({
            populates: {
              posts: {
                service: 'posts',
                nameAs: 'posts',
                keyHere: 'id',
                keyThere: 'userId',
                asArray: true,
                params: {
                  query: {
                    published: true,
                    $select: ['id', 'userId', 'title'],
                  },
                },
              },
            },
          }),
        ],
      },
    })

    const user = await users.create({ name: 'u' })
    await posts.create([
      { userId: user.id, title: 'public', published: true, secret: 's' },
      { userId: user.id, title: 'draft', published: false, secret: 's' },
    ])

    const withUnpublished = (await users.get(user.id, {
      $populateParams: { query: { posts: { published: false } } },
    } as any)) as any

    assert.deepStrictEqual(
      withUnpublished.posts,
      [],
      'published: true of the populate params is not overridden',
    )

    const withSecret = (await users.get(user.id, {
      $populateParams: { query: { posts: { $select: ['title', 'secret'] } } },
    } as any)) as any

    assert.deepStrictEqual(
      withSecret.posts.map((post: any) => Object.keys(post).sort()),
      [['id', 'title']],
      '$select cannot add fields that are not selected by the populate params',
    )
    assert.strictEqual(withSecret.posts[0].title, 'public')
  })
})
