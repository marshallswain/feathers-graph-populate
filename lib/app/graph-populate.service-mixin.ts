import { enableHooks } from './hooks.commons'

import type { Service } from '@feathersjs/feathers'

export default (service: Service<unknown>): void => {
  if (!service.graphPopulate) {
    service.graphPopulate = {}
  }

  const methods = ['find', 'get', 'create', 'update', 'patch', 'remove']
  const types = ['before', 'after']

  enableHooks(service.graphPopulate, methods, types)
}
