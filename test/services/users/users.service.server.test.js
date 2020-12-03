
const assert = require('assert')
const { readJsonFileSync } = require('@feathers-plus/test-utils')
const app = require('../../../src/app')
const { populateUtil } = require('../../../lib/index')
const { omit, orderBy } = require('lodash')
const userPopulates = require('../../../src/services/users/users.schema').populates

const fakeData = readJsonFileSync(app.get('seeds').fakeData) || {}

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

      it('populates supports `$limit` in $populateParams by default', async () => {
        const user1 = (await app.service('users').find({
          query: {},
          $populateParams: {
            query: {
              posts: {}
            }
          },
          paginate: false
        }))[0]

        const user2 = (await app.service('users').find({
          query: {},
          $populateParams: {
            query: {
              posts: {
                $limit: 1
              }
            }
          },
          paginate: false
        }))[0]

        assert(user1.posts.length > 1, 'reference user has more than 1 post')
        assert(user2.posts.length === 1, 'user has only one post')
      })

      it('populates supports `$select` in $populateParams by default', async () => {
        const users = await app.service('users').find({
          query: {},
          $populateParams: {
            query: {
              posts: {
                $select: ['_id', 'authorId']
              }
            }
          },
          paginate: false
        })

        const user = users[0]

        assert(user.posts.length, 'user has posts')
        user.posts.forEach(post => {
          assert.deepStrictEqual(omit(post, ['_id', 'authorId']), {}, 'post only has `_id` and `authorId`')
          assert.strictEqual(post.authorId, user._id, 'post was added to the correct user')
        })
      })

      it('populates supports `$skip` in $populateParams by default', async () => {
        const user1 = (await app.service('users').find({
          query: {},
          $populateParams: {
            query: {
              posts: {}
            }
          },
          paginate: false
        }))[0]

        const user2 = (await app.service('users').find({
          query: {},
          $populateParams: {
            query: {
              posts: {
                $skip: 1
              }
            }
          },
          paginate: false
        }))[0]

        assert(user1.posts.length - 1 === user2.posts.length, 'skipped one post for second user')
      })

      it('populates supports `$sort` in $populateParams by default', async () => {
        const user1 = (await app.service('users').find({
          query: {},
          $populateParams: {
            query: {
              posts: {
                $sort: {
                  title: 1
                }
              }
            }
          },
          paginate: false
        }))[0]

        const user2 = (await app.service('users').find({
          query: {},
          $populateParams: {
            query: {
              posts: {
                $sort: {
                  title: -1
                }
              }
            }
          },
          paginate: false
        }))[0]

        const posts1 = user1.posts
        const posts2 = user2.posts

        assert(posts1.length > 1, 'has at least some posts')
        assert.notDeepStrictEqual(posts1, posts2, 'arrays differ')
        assert.deepStrictEqual(orderBy(posts1, 'title'), orderBy(posts2, 'title'), 'same entries')
        assert.deepStrictEqual(posts1, orderBy(posts1, 'title', 'asc'), 'sorted alphabetically ascending')
        assert.deepStrictEqual(posts2, orderBy(posts2, 'title', 'desc'), 'sorted alphabetically descending')
      })

      it('ignore custom query for $populateParams', async () => {
        const users1 = await app.service('users').find({
          query: {},
          $populateParams: {
            query: {
              posts: {}
            }
          },
          paginate: false
        })

        const users2 = await app.service('users').find({
          query: {},
          $populateParams: {
            query: {
              posts: {
                test: {}
              }
            }
          },
          paginate: false
        })

        assert.deepStrictEqual(users1, users2, 'custom query doesnt matter')
      })

      it('custom query in `service.options.graphPopulate.whitelist` for $populateParams', async () => {
        const title = 'ipsam modi minima'

        const user1 = (await app.service('users').find({
          query: {},
          $populateParams: {
            query: {
              posts: {}
            }
          },
          paginate: false
        }))[0]

        const user2 = (await app.service('users').find({
          query: {},
          $populateParams: {
            query: {
              posts: {
                title,
                $select: ['title']
              }
            }
          },
          paginate: false
        }))[0]

        assert(user1.posts.some(post => post.title !== title), 'reference user has other posts')
        assert(user2.posts.length > 0 && user2.posts.every(post => post.title === title), 'only posts with given title')
      })

      it('custom query in $populateParams works with complex relation defined by `requestPerItem`', async () => {
        const usersWithOrgNames = (await app.service('users').find({
          query: {},
          $populateParams: {
            query: {
              organizations: {
                $select: ['name']
              }
            }
          },
          paginate: false
        }))

        const everyUserHasOrganizations = usersWithOrgNames.every(user => user.organizations.length !== undefined)

        assert(everyUserHasOrganizations, 'populated organizations')
        usersWithOrgNames.forEach(user => {
          user.organizations.forEach(org => {
            assert.deepStrictEqual(omit(org, ['name']), {}, 'org only has `name` property')
          })
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
        await Promise.all([
          app.service('org-users').create(fakeData.orgUsers),
          app.service('orgs').create(fakeData.orgs),
          app.service('group-users').create(fakeData.groupUsers),
          app.service('groups').create(fakeData.groups),
          app.service('tasks').create(fakeData.tasks)
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
