import { _ } from '@feathersjs/commons'
const { each } = _
import _get from 'lodash/get'

import type {
  AnyData,
  GraphPopulateHook,
  GraphPopulateHookMap
} from '../types'

export function convertHookData (obj: GraphPopulateHook|AnyData|unknown[]): Partial<GraphPopulateHookMap> {
  let hook: Partial<GraphPopulateHookMap> = {}

  if (Array.isArray(obj)) {
    hook = { all: obj }
  } else if (typeof obj !== 'object') {
    hook = { all: [ obj ] }
  } else {
    each(obj, function (value, key) {
      hook[key] = !Array.isArray(value) ? [ value ] : value
    })
  }

  return hook
}

// eslint-disable-next-line
export function getHooks (app: any, service: any, type: string, method: string, appLast: boolean = false): any[] {
  const appHooks = _get(app, ['__hooks', type, method]) || []
  const serviceHooks = _get(service, ['__hooks', type, method]) || []

  return (appLast)
    ? [
      ...serviceHooks,
      ...appHooks
    ]
    : [
      ...appHooks,
      ...serviceHooks
    ]
}

// eslint-disable-next-line
export function enableHooks (obj: any, methods: string[], types: string[]): AnyData {
  if (typeof obj.hooks === 'function') {
    return obj
  }

  const hookData: Partial<{ before: Partial<GraphPopulateHookMap>, after: Partial<GraphPopulateHookMap>, error: Partial<GraphPopulateHookMap> }> = {}

  types.forEach(type => {
    // Initialize properties where hook functions are stored
    hookData[type] = {}
  })

  // Add non-enumerable `__hooks` property to the object
  Object.defineProperty(obj, '__hooks', {
    configurable: true,
    value: hookData,
    writable: true
  })

  return Object.assign(obj, {
    hooks (allHooks: Partial<{before: Partial<GraphPopulateHookMap>, after: Partial<GraphPopulateHookMap>, error: Partial<GraphPopulateHookMap> }> | GraphPopulateHook | GraphPopulateHook[]) {
      each(allHooks, (current: GraphPopulateHook|AnyData|unknown[], type) => {
        if (!this.__hooks[type]) {
          throw new Error(`'${type}' is not a valid hook type`)
        }

        const hooks = convertHookData(current)

        /*each(hooks, (_value, method) => {
          if (method !== 'all' && methods.indexOf(method) === -1) {
            throw new Error(`'${method}' is not a valid hook method`)
          }
        })*/

        methods.forEach(method => {
          const currentHooks = this.__hooks[type][method] || (this.__hooks[type][method] = [])

          if (hooks.all) {
            currentHooks.push(...hooks.all)
          }

          if (hooks[method]) {
            currentHooks.push(...hooks[method])
          }
        })
      })

      return this
    }
  })
}
