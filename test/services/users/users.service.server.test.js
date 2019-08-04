
const assert = require('assert')
const { readJsonFileSync } = require('@feathers-plus/test-utils')
const app = require('../../../src/app')
const config = require('../../../config/default.json')
const { populateUtil } = require('../../../lib/index')
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
    describe('One Level Deep', () => {
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
    describe('Two Levels Deep', () => {
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

    describe('Three Levels Deep', () => {
      it('populates external, by name', async () => {
        const users = await app.service('users').find({
          query: {},
          $populateParams: {
            name: 'postsWithCommentsWithUser'
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
            assert(comment.user, 'populated the user object')
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
                comments: {
                  user: {}
                }
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
            assert(comment.user, 'populated the user object')
          })
        })
      })
    })

    describe('Multiple Populates Per Level', () => {
      before(async () => {
        await Promise.all([
          app.service('org-users').remove(null),
          app.service('orgs').remove(null),
          app.service('group-users').remove(null),
          app.service('groups').remove(null),
          app.service('tasks').remove(null),
        ])
        await Promise.all([
          app.service('org-users').create(fakeData.orgUsers),
          app.service('orgs').create(fakeData.orgs),
          app.service('group-users').create(fakeData.groupUsers),
          app.service('groups').create(fakeData.groups),
          app.service('tasks').create(fakeData.tasks)
        ])
      })
      after(async () => {
        await Promise.all([
          app.service('org-users').remove(null),
          app.service('orgs').remove(null),
          app.service('group-users').remove(null),
          app.service('groups').remove(null),
          app.service('tasks').remove(null),
        ])
      })

      it('populates multiple relationships at multiple levels', async () => {
        const users = await app.service('users').find({
          query: {},
          $populateParams: {
            query: {
              orgMemberships: {
                org: {},
                user: {}
              },
              groupMemberships: {
                group: {},
                org: {},
                user: {}
              },
              posts: {
                comments: {}
              },
              comments: {
                post: {}
              },
              tasks: {}
            }
          },
          paginate: false
        })
        const user = users[0]

        assert(user.orgMemberships.length, 'user has orgMemberships')
        user.orgMemberships.forEach(orgMembership => {
          assert(orgMembership.org, 'got orgMembership with nested org')
          assert(orgMembership.user, 'got orgMembership with nested user')
        })

        user.groupMemberships.forEach(groupMembership => {
          assert(groupMembership.org, 'got groupMembership with nested org')
          assert(groupMembership.group, 'got groupMembership with nested group')
          assert(groupMembership.user, 'got groupMembership with nested user')
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

        assert(user.comments.length, 'got all of the user comments')
        user.comments.forEach(comment => {
          assert(comment.post, 'got the post nested in the coment')
        })

        const tasks = await app.service('tasks').find({
          query: {
            ownerIds: user._id
          },
          paginate: false
        })

        assert.strictEqual(user.tasks.length, tasks.length, 'got all of the user tasks')
      })
    })

    describe('Recursive Populates', () => {
      before(async () => {
        await Promise.all([
          app.service('tasks').remove(null),
        ])
        await Promise.all([
          app.service('tasks').create(fakeData.tasks)
        ])
      })
      after(async () => {
        await Promise.all([
          app.service('tasks').remove(null),
        ])
      })
      it('can handle recursive populates', async () => {
        const users = await app.service('users').find({
          query: {},
          $populateParams: {
            query: {
              tasks: {
                childTasks: {
                  childTasks: {
                    childTasks: {}
                  }
                }
              }
            }
          },
          paginate: false
        })
        const user = users[0]

        assert(user.tasks.length)
        user.tasks.forEach(task => {
          assert(task.childTasks.length, 'got the childTasks')

          task.childTasks.forEach(task => {
            assert(task.childTasks.length, 'got the childTasks')

            task.childTasks.forEach(task => {
              assert(task.childTasks.length, 'got the childTasks')

              task.childTasks.forEach(task => {
                assert(!task.ChildTasks, 'no tasks populated at this level')
              })
            })
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
