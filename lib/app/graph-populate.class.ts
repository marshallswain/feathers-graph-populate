import {
  enableHooks,
  getHooks
} from './hooks.commons'

import type { Application, Service } from '@feathersjs/feathers'

import type {
  Method,
  GraphPopulateHook,
  SingleGraphPopulateParams,
  AnyData
} from '../types'

export class GraphPopulateApplication {
  private _app: Application
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  __hooks: any
  hooks: (hooks: GraphPopulateHook|AnyData|unknown[]) => void

  constructor(app: Application) {
    this._app = app

    const methods = ['find', 'get', 'create', 'update', 'patch', 'remove']
    const types = ['before', 'after']

    enableHooks(this, methods, types)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withAppParams(params: SingleGraphPopulateParams|SingleGraphPopulateParams[], method: Method, service: Service<unknown>): SingleGraphPopulateParams[]  {
    const serviceHooks = service?.graphPopulate?.__hooks
    if (!this.__hooks && !serviceHooks) {
      if (!params) { return [] }
      if (Array.isArray(params)) {
        return params
      } else {
        return [params]
      }
    }
    const currentParams = [] as SingleGraphPopulateParams[]

    const before = getHooks(this, service.graphPopulate, 'before', method)
    if (before.length > 0) {
      currentParams.push(...before)
    }

    if (params) {
      if (Array.isArray(params) && params.length > 0) {
        currentParams.push(...params)
      } else {
        currentParams.push(params)
      }
    }

    const after = getHooks(this, service.graphPopulate, 'after', method, true)

    if (after.length > 0) {
      currentParams.push(...after)
    }


    return currentParams
  }
}
