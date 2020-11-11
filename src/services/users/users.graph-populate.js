const populates = {
  orgMemberships: {
    service: 'org-users',
    nameAs: 'orgMemberships',
    keyHere: '_id',
    keyThere: 'userId',
    asArray: true,
    params: {},
  },
  groupMemberships: {
    service: 'group-users',
    nameAs: 'groupMemberships',
    keyHere: '_id',
    keyThere: 'userId',
    asArray: true,
    params: {},
  },
  posts: {
    service: 'posts',
    nameAs: 'posts',
    keyHere: '_id',
    keyThere: 'authorId',
    asArray: true,
    params: {},
  },
  comments: {
    service: 'comments',
    nameAs: 'comments',
    keyHere: '_id',
    keyThere: 'userId',
    asArray: true,
    params: {},
  },
  tasks: {
    service: 'tasks',
    nameAs: 'tasks',
    keyHere: '_id',
    keyThere: 'ownerIds',
    asArray: true,
    params: {},
  },
  organizations: {
    service: 'orgs',
    nameAs: 'organizations',
    asArray: true,
    params: async function(params, context) {
      const orgUsers = await context.app.service('org-users').find({
        query: {
          userId: this._id
        },
        paginate: false
      });
      const ids = [...new Set(orgUsers.map(x => x.orgId))]
      return {
        query: {
          _id: {
            $in: ids
          }
        }
      }
    }
  }
};

const namedQueries = {
  withPosts: {
    posts: {},
  },
  postsWithComments: {
    posts: {
      comments: {},
    },
  },
  postsWithCommentsWithUser: {
    posts: {
      comments: {
        user: {},
      },
    },
  },
  withPostIds: {
    posts: {
      $select: ['id']
    }
  }
};

module.exports = {
  populates,
  namedQueries,
  defaultQueryName: undefined,
  whitelist: []
}
