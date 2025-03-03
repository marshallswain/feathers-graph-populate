import { enableHooks, getHooks } from './hooks.commons'

import type { Application, Service } from '@feathersjs/feathers'

import type {
  Method,
  GraphPopulateHook,
  SingleGraphPopulateParams,
  AnyData,
  InitOptions,
} from '../types'

export class GraphPopulateApplication {
  private _app: Application

  __hooks: any
  // @ts-expect-error setup in 'enableHooks'
  hooks: (hooks: GraphPopulateHook | AnyData | unknown[]) => void
  options?: InitOptions

  constructor(app: Application, options?: InitOptions) {
    this._app = app
    this.options = options

    const methods = ['find', 'get', 'create', 'update', 'patch', 'remove']
    const types = ['before', 'after']

    enableHooks(this, methods, types)
  }

  withAppParams(
    params: SingleGraphPopulateParams | SingleGraphPopulateParams[],
    method: Method,
    service: Service<unknown>,
  ): SingleGraphPopulateParams[] {
    // @ts-expect-error add graphPopulate to service
    const serviceHooks = service?.graphPopulate?.__hooks
    if (!this.__hooks && !serviceHooks) {
      if (!params) {
        return []
      }
      if (Array.isArray(params)) {
        return params
      } else {
        return [params]
      }
    }
    const currentParams = [] as SingleGraphPopulateParams[]

    // @ts-expect-error add graphPopulate to service
    const before = getHooks(this, service.graphPopulate, 'before', method)
    if (before.length > 0) {
      currentParams.push(...before)
    }

    if (params) {
      if (Array.isArray(params)) {
        currentParams.push(...params)
      } else {
        currentParams.push(params)
      }
    }

    // @ts-expect-error add graphPopulate to service
    const after = getHooks(this, service.graphPopulate, 'after', method, true)

    if (after.length > 0) {
      currentParams.push(...after)
    }

    return currentParams
  }

  get allowUnnamedQueryForExternal(): boolean | undefined {
    return this.options?.allowUnnamedQueryForExternal
  }
}
