import { enableHooks } from './hooks.commons.js'

import type { Service } from '@feathersjs/feathers'

export const serviceMixin = (
  service: Service & { graphPopulate?: any },
): void => {
  if (!service.graphPopulate) {
    service.graphPopulate = {}
  }

  const methods = ['find', 'get', 'create', 'update', 'patch', 'remove']
  const types = ['before', 'after']

  enableHooks(service.graphPopulate, methods, types)
}
