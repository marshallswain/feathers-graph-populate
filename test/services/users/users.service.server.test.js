
const assert = require('assert')
const { readJsonFileSync } = require('@feathers-plus/test-utils')
const app = require('../../../src/app')
const config = require('../../../config/default.json')
const populateUtil = require('../../../lib/util.populate')
const userPopulates = require('../../../src/services/users/users.schema').populates

// Determine if environment allows test to mutate existing DB data.
const env = (config.tests || {}).environmentsAllowingSeedData || []
if (!env.includes(process.env.NODE_ENV)) {
  // eslint-disable-next-line no-console
  console.log('SKIPPED - Test users/users.service.server.test.js')

  return
}

// eslint-disable-next-line no-unused-vars
const fakeData = readJsonFileSync([__dirname, '../../../seeds/fake-data.json']) || {}

describe('Test users/users.service.server.test.js', () => {
  before(async () => {
    await Promise.all([
      app.service('users').remove(null),
      app.service('posts').remove(null),
      app.service('comments').remove(null),
    ])
    await Promise.all([
      app.service('users').create(fakeData.users),
      app.service('posts').create(fakeData.posts),
      app.service('comments').create(fakeData.comments)
    ])
  })
  after(async () => {
    await Promise.all([
      app.service('users').remove(null),
      app.service('posts').remove(null),
      app.service('comments').remove(null),
    ])
  })

  it('registered the service', () => {
    const service = app.service('/users')

    assert.ok(service, 'Registered the service')
  })

  describe('Populate Hook', () => {
    describe('one level deep', () => {
      it('populates external, by name', async () => {
        const users = await app.service('users').find({
          query: {},
          $populateParams: {
            name: 'withPosts'
          },
          paginate: false,
          provider: 'socketio'
        })

        const user = users[0]

        assert(user.posts.length, 'user has posts')
        user.posts.forEach(post => {
          assert.strictEqual(post.authorId, user._id, 'post was added to the correct user')
          assert(!post.author, 'no author was populated, since we did not request one.')
          assert(!post.comments, 'no comments were populated, since we did not request any.')
        })
      })

      it('populates nothing external, by query', async () => {
        const users = await app.service('users').find({
          query: {},
          $populateParams: {
            query: {
              posts: {}
            }
          },
          paginate: false,
          provider: 'socketio'
        })

        const user = users[0]

        assert(!user.posts, 'posts were not populated')
      })

      it('populates internal, by query', async () => {
        const users = await app.service('users').find({
          query: {},
          $populateParams: {
            query: {
              posts: {}
            }
          },
          paginate: false
        })

        const user = users[0]

        assert(user.posts.length, 'user has posts')
        user.posts.forEach(post => {
          assert.strictEqual(post.authorId, user._id, 'post was added to the correct user')
          assert(!post.author, 'no author was populated, since we did not request one.')
          assert(!post.comments, 'no comments were populated, since we did not request any.')
        })
      })

    })
    describe('two levels deep', () => {
      it('populates external, by name', async () => {
        const users = await app.service('users').find({
          query: {},
          $populateParams: {
            name: 'postsWithComments'
          },
          paginate: false,
          provider: 'socketio'
        })

        const user = users[0]

        assert(user.posts.length, 'user has posts')
        user.posts.forEach(post => {
          assert.strictEqual(post.authorId, user._id, 'post was added to the correct user')
          assert(!post.author, 'no author was populated, since we did not request one.')
          assert(post.comments.length, 'comments were populated')
          post.comments.forEach(comment => {
            assert.strictEqual(post._id, comment.postId, 'the comment was populated on the correct post.')
          })
        })
      })

      it('populates nothing external, by query', async () => {
        const users = await app.service('users').find({
          query: {},
          $populateParams: {
            query: {
              posts: {
                comments: {}
              }
            }
          },
          paginate: false,
          provider: 'socketio'
        })

        const user = users[0]

        assert(!user.posts, 'posts were not populated')
      })

      it('populates internal, by query', async () => {
        const users = await app.service('users').find({
          query: {},
          $populateParams: {
            query: {
              posts: {
                comments: {}
              }
            }
          },
          paginate: false
        })

        const user = users[0]

        assert(user.posts.length, 'user has posts')
        user.posts.forEach(post => {
          assert.strictEqual(post.authorId, user._id, 'post was added to the correct user')
          assert(!post.author, 'no author was populated, since we did not request one.')
          assert(post.comments.length, 'comments were populated')
          post.comments.forEach(comment => {
            assert.strictEqual(post._id, comment.postId, 'the comment was populated on the correct post.')
          })
        })
      })
    })
  })
  describe('Populate Utility', () => {
    it('populates on a single record', async () => {
      const users = await app.service('users').find({
        query: {
          $limit: 1
        },
        paginate: false
      })
      const user = users[0]

      await populateUtil(user, {
        app,
        params: {
          $populateParams: {
            query: {
              posts: {
                comments: {}
              }
            }
          }
        },
        populates: userPopulates,
      })

      assert(user.posts.length, 'user has posts')
      user.posts.forEach(post => {
        assert.strictEqual(post.authorId, user._id, 'post was added to the correct user')
        assert(!post.author, 'no author was populated, since we did not request one.')
        assert(post.comments.length, 'comments were populated')
        post.comments.forEach(comment => {
          assert.strictEqual(post._id, comment.postId, 'the comment was populated on the correct post.')
        })
      })
    })
  })
})
