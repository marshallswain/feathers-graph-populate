import type { Application } from '@feathersjs/feathers'
import { feathers } from '@feathersjs/feathers'
import { MemoryService } from '@feathersjs/memory'
import * as usersGraphPopulate from './populates.users'
import * as postsGraphPopulate from './populates.posts'
import * as commentsGraphPopulate from './populates.comments'
import * as groupUsersGraphPopulate from './populates.group-users'
import * as groupsGraphPopulate from './populates.groups'
import * as orgUsersGraphPopulate from './populates.org-users'
import * as orgsGraphPopulate from './populates.orgs'
import * as tasksGraphPopulate from './populates.tasks'
import type { PopulateHookOptions } from '../../src'
import * as fakeData from './data'
import { populate } from '../../src'

type MakeAppOptions = {
  allowUnnamedQueryForExternal?: boolean
}

export async function makeApp(options?: MakeAppOptions): Promise<{
  app: Application
}> {
  const app = feathers()

  app.use('comments', createService())
  usePopulateHook(app, 'comments', {
    ...commentsGraphPopulate,
    allowUnnamedQueryForExternal: options?.allowUnnamedQueryForExternal,
  })

  app.use('group-users', createService())
  usePopulateHook(app, 'group-users', {
    ...groupUsersGraphPopulate,
    allowUnnamedQueryForExternal: options?.allowUnnamedQueryForExternal,
  })

  app.use('groups', createService())
  usePopulateHook(app, 'groups', {
    ...groupsGraphPopulate,
    allowUnnamedQueryForExternal: options?.allowUnnamedQueryForExternal,
  })

  app.use('org-users', createService())
  usePopulateHook(app, 'org-users', {
    ...orgUsersGraphPopulate,
    allowUnnamedQueryForExternal: options?.allowUnnamedQueryForExternal,
  })

  app.use('orgs', createService())
  usePopulateHook(app, 'orgs', {
    ...orgsGraphPopulate,
    allowUnnamedQueryForExternal: options?.allowUnnamedQueryForExternal,
  })

  app.use('posts', createService({ graphPopulate: postsGraphPopulate }))
  usePopulateHook(app, 'posts', {
    ...postsGraphPopulate,
    allowUnnamedQueryForExternal: options?.allowUnnamedQueryForExternal,
  })

  app.use('tasks', createService())
  usePopulateHook(app, 'tasks', {
    ...tasksGraphPopulate,
    allowUnnamedQueryForExternal: options?.allowUnnamedQueryForExternal,
  })

  app.use('users', createService({ graphPopulate: usersGraphPopulate }))
  usePopulateHook(app, 'users', {
    ...usersGraphPopulate,
    allowUnnamedQueryForExternal: options?.allowUnnamedQueryForExternal,
  })

  await Promise.all([
    app.service('users').create(fakeData.users),
    app.service('posts').create(fakeData.posts),
    app.service('comments').create(fakeData.comments),
    app.service('org-users').create(fakeData.orgUsers),
    app.service('orgs').create(fakeData.orgs),
    app.service('group-users').create(fakeData.groupUsers),
    app.service('groups').create(fakeData.groups),
    app.service('tasks').create(fakeData.tasks),
  ])

  return { app }
}

function createService(opts: any = {}) {
  opts = Object.assign({ id: 'id', multi: true }, opts)

  return new MemoryService(opts)
}

function usePopulateHook(
  app: Application,
  serviceName: string,
  gp: PopulateHookOptions,
) {
  app.service(serviceName).hooks({
    after: {
      all: [populate(gp)],
    },
  })
}
