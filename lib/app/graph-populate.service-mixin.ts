import { Service } from '@feathersjs/feathers'
import { enableHooks } from './hooks.commons'

export default (service: Service<unknown>): void => {
  if (!service.graphPopulate) {
    service.graphPopulate = {}
  }

  const methods = ['find', 'get', 'create', 'update', 'patch', 'remove']
  const types = ['before', 'after']

  enableHooks(service.graphPopulate, methods, types)
}
