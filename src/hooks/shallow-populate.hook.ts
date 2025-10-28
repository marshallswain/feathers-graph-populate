import _get from 'lodash/get.js'
import _set from 'lodash/set.js'

import type { CumulatedIncludeAndIds } from '../utils/shallow-populate.utils.js'
import {
  assertIncludes,
  makeCumulatedRequest,
  makeRequestPerItem,
  noRelation,
  setItems,
  shouldCatchOnError,
} from '../utils/shallow-populate.utils.js'

import type { HookContext } from '@feathersjs/feathers'

import type {
  AnyData,
  CumulatedRequestResult,
  IncludeCumulated,
  IncludeShared,
  PopulateObject,
  ShallowPopulateOptions,
} from '../types.js'
import { toArray } from '../utils/to-array.js'

export function shallowPopulate(
  opts: ShallowPopulateOptions,
): (context: HookContext) => Promise<HookContext> {
  const options = {
    catchOnError: false,
    ...opts,
  }

  const includes = toArray<PopulateObject>(options.include)

  if (!includes.length) {
    throw new Error(
      'shallowPopulate hook: You must provide one or more relationships in the `include` option.',
    )
  }

  assertIncludes(includes)

  const cumulatedIncludes = includes.filter(
    (include) => !include.requestPerItem,
  ) as IncludeCumulated[]

  const includesPerItem = includes.filter(
    (include) => include.requestPerItem,
  ) as IncludeShared[]

  return async (context: HookContext): Promise<HookContext> => {
    const { app, type } = context
    let data: AnyData[] =
      type === 'before'
        ? context.data
        : context.method === 'find'
          ? context.result.data || context.result
          : context.result

    data = toArray(data)

    if (!data.length) {
      return context
    }

    const includesAndIds: CumulatedIncludeAndIds[] = []

    for (const include of cumulatedIncludes) {
      let result: CumulatedIncludeAndIds | undefined = undefined

      for (const item of data) {
        const id = _get(item, include.keyHere!)
        if (id == null) {
          _set(item, include.nameAs, noRelation(include))
          continue
        }

        if (!result) {
          result = { include, ids: [] }
        }

        const ids = toArray(id)

        for (const id of ids) {
          if (!result.ids.includes(id)) {
            result.ids.push(id)
          }
        }
      }

      if (result) {
        includesAndIds.push(result)
      }
    }

    const promises: Promise<CumulatedRequestResult>[] = []

    for (const keyHere in includesAndIds) {
      const includeAndIds = includesAndIds[keyHere]
      if (!includeAndIds.ids.length) continue

      promises.push(
        new Promise<CumulatedRequestResult>((resolve, reject) => {
          makeCumulatedRequest(app, includeAndIds, context)
            .then(resolve)
            .catch((err) => {
              if (!shouldCatchOnError(options, includeAndIds.include)) {
                reject(err)
                return
              }

              resolve({ include: includeAndIds.include })
            })
        }),
      )
    }

    const cumulatedResults = await Promise.all(promises)

    cumulatedResults.forEach((result) => {
      if (!result) return
      const { include } = result
      if (!result.response) {
        data.forEach((item) => {
          _set(item, include.nameAs, noRelation(include))
        })
        return
      }
      const { params, response } = result
      setItems(data, include, params, response)
    })

    const promisesPerIncludeAndItem: Promise<unknown>[] = []

    includesPerItem.forEach((include) => {
      const promisesPerItem = data.map(async (item) => {
        try {
          await makeRequestPerItem(item, app, include, context)
        } catch (err) {
          if (!shouldCatchOnError(options, include)) throw err
          _set(item, include.nameAs, noRelation(include))
        }
      })
      promisesPerIncludeAndItem.push(...promisesPerItem)
    })

    await Promise.all(promisesPerIncludeAndItem)

    return context
  }
}
