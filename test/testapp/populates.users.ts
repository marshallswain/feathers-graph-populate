import type { HookContext, Params } from '@feathersjs/feathers'

export const populates = {
  orgMemberships: {
    service: 'org-users',
    nameAs: 'orgMemberships',
    keyHere: 'id',
    keyThere: 'userId',
    asArray: true,
    params: {},
  },
  groupMemberships: {
    service: 'group-users',
    nameAs: 'groupMemberships',
    keyHere: 'id',
    keyThere: 'userId',
    asArray: true,
    params: {},
  },
  posts: {
    service: 'posts',
    nameAs: 'posts',
    keyHere: 'id',
    keyThere: 'authorId',
    asArray: true,
    params: {},
  },
  comments: {
    service: 'comments',
    nameAs: 'comments',
    keyHere: 'id',
    keyThere: 'userId',
    asArray: true,
    params: {},
  },
  tasks: {
    service: 'tasks',
    nameAs: 'tasks',
    keyHere: 'id',
    keyThere: 'ownerIds',
    asArray: true,
    params: {},
  },
  organizations: {
    service: 'orgs',
    nameAs: 'organizations',
    asArray: true,
    params: async function (params: Params, context: HookContext): Promise<Params> {
      const orgUsers = await context.app.service('org-users').find({
        query: {
          userId: this.id,
        },
        paginate: false,
      })
      const ids = [...new Set(orgUsers.map((x) => x.orgId))]
      return {
        query: {
          id: {
            $in: ids,
          },
        },
      }
    },
  },
}

export const namedQueries = {
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
      $select: ['id'],
    },
  },
}
