import type { Application, HookContext } from '@feathersjs/feathers'
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
import { populate } from '../../src'

export default function makeApp(): Application {
  const app = feathers()

  app.use('comments', createService())
  usePopulateHook(app, 'comments', commentsGraphPopulate)

  app.use('group-users', createService())
  usePopulateHook(app, 'group-users', groupUsersGraphPopulate)

  app.use('groups', createService())
  usePopulateHook(app, 'groups', groupsGraphPopulate)

  app.use('org-users', createService())
  usePopulateHook(app, 'org-users', orgUsersGraphPopulate)

  app.use('orgs', createService())
  usePopulateHook(app, 'orgs', orgsGraphPopulate)

  app.use('posts', createService({ graphPopulate: postsGraphPopulate }))
  usePopulateHook(app, 'posts', postsGraphPopulate)

  app.use('tasks', createService())
  usePopulateHook(app, 'tasks', tasksGraphPopulate)

  app.use('users', createService({ graphPopulate: usersGraphPopulate }))
  usePopulateHook(app, 'users', usersGraphPopulate)

  return app
}

function createService(opts: any = {}) {
  opts = Object.assign({ id: 'id', multi: true }, opts)

  return new MemoryService(opts)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function usePopulateHook(app: Application, serviceName: string, gp: any) {
  app.service(serviceName).hooks({
    after: {
      all: [populate(gp)],
    },
  })
}
