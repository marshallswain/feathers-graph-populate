import _get from 'lodash/get'
import _set from 'lodash/set'
import _has from 'lodash/has'
import { HookContext } from '@feathersjs/feathers'

import {
  assertIncludes,
  makeCumulatedRequest,
  makeRequestPerItem,
  mapDataWithId,
  setItems,
  shouldCatchOnError
} from '../utils/shallow-populate.utils'

import {
  CumulatedRequestResult,
  PopulateObject,
  ShallowPopulateOptions
} from '../types'

const defaults: ShallowPopulateOptions = {
  include: undefined,
  catchOnError: false
}

export default function (
  options: Partial<ShallowPopulateOptions> & Pick<ShallowPopulateOptions, 'include'>
): ((context: HookContext) => Promise<HookContext>) {
  options = Object.assign({}, defaults, options)

  // Make an array of includes
  const includes: PopulateObject[] = [].concat(options.include || [])

  if (!includes.length) {
    throw new Error('shallowPopulate hook: You must provide one or more relationships in the `include` option.')
  }

  assertIncludes(includes)

  const cumulatedIncludes = includes.filter(include => !include.requestPerItem)

  const includesByKeyHere = cumulatedIncludes.reduce((includes, include) => {
    if (_has(include, 'keyHere') && !includes[include.keyHere]) {
      includes[include.keyHere] = include
    }
    return includes
  }, {})

  const keysHere = Object.keys(includesByKeyHere)

  const includesPerItem = includes.filter(include => include.requestPerItem)

  return async function shallowPopulate (
    context: HookContext
  ): Promise<HookContext> {
    const { app, type } = context
    let data: Record<string, unknown>[] = type === 'before'
      ? context.data
      : context.method === 'find'
        ? (context.result.data || context.result)
        : context.result

    data = [].concat(data || [])

    if (!data.length) {
      return context
    }

    const dataMap: Record<string, unknown> = data.reduce((
      byKeyHere: Record<string, unknown>,
      current: Record<string, unknown>
    ) => {
      keysHere.forEach(key => {
        byKeyHere[key] = byKeyHere[key] || {}
        const keyHere = _get(current, key) as string | string[]

        if (keyHere !== undefined) {
          if (Array.isArray(keyHere)) {
            if (!includesByKeyHere[key].asArray) {
              mapDataWithId(byKeyHere, key, keyHere[0], current)
            } else {
              keyHere.forEach(hereKey => mapDataWithId(byKeyHere, key, hereKey, current))
            }
          } else {
            mapDataWithId(byKeyHere, key, keyHere, current)
          }
        }
      })

      return byKeyHere
    }, {})

    const promisesCumulatedResults = cumulatedIncludes.map(async (
      include: PopulateObject
    ): Promise<CumulatedRequestResult> => {
      let result: CumulatedRequestResult
      try {
        result = await makeCumulatedRequest(app, include, dataMap, context)
      } catch (err) {
        if (!shouldCatchOnError(options, include)) throw err
        return { include }
      }
      return result
    })

    const cumulatedResults = await Promise.all(promisesCumulatedResults)

    cumulatedResults.forEach(result => {
      if (!result) return
      const { include } = result
      if (!result.response) {
        data.forEach(item => {
          _set(item, include.nameAs, (include.asArray) ? [] : {})
        })
        return
      }
      const { params, response } = result
      setItems(data, include, params, response)
    })

    const promisesPerIncludeAndItem: Promise<unknown>[] = []

    includesPerItem.forEach(include => {
      const promisesPerItem = data.map(async item => {
        try {
          await makeRequestPerItem(item, app, include, context)
        } catch (err) {
          if (!shouldCatchOnError(options, include)) throw err
          _set(item, include.nameAs, (include.asArray) ? [] : {})
        }
      })
      promisesPerIncludeAndItem.push(...promisesPerItem)
    })

    await Promise.all(promisesPerIncludeAndItem)

    return context
  }
}
