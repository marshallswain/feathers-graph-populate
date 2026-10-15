import type { Id } from '@feathersjs/feathers'

import { applyIncludeDefaults } from '../utils/apply-include-defaults.js'
import { assertIncludes } from '../utils/assert-includes.js'
import type { CumulatedIncludeAndIds } from '../utils/make-cumulated-request.js'
import { makeCumulatedRequest } from '../utils/make-cumulated-request.js'
import { makeRequestPerItem } from '../utils/make-request-per-item.js'
import { noRelation } from '../utils/no-relation.js'
import { setItems } from '../utils/set-items.js'
import { shouldCatchOnError } from '../utils/should-catch-on-error.js'

import type {
  AnyData,
  CumulatedRequestResult,
  GraphPopulateHookFunction,
  IncludeCumulated,
  IncludeShared,
  PopulateObject,
  ShallowPopulateOptions,
} from '../types.js'
import { get, set } from '../utils/object.js'
import { toArray } from '../utils/to-array.js'

export function shallowPopulate(
  opts: ShallowPopulateOptions,
): GraphPopulateHookFunction {
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

  applyIncludeDefaults(includes)
  assertIncludes(includes)

  const cumulatedIncludes = includes.filter(
    (include) => !include.requestPerItem,
  ) as IncludeCumulated[]

  const includesPerItem = includes.filter(
    (include) => include.requestPerItem,
  ) as IncludeShared[]

  return async (context, next) => {
    const isAround = typeof next === 'function'
    if (isAround) await next!()

    const { app, type } = context
    const useData = !isAround && type === 'before'
    let data: AnyData[] = useData
      ? context.data
      : context.method === 'find'
        ? context.result.data || context.result
        : context.result

    data = toArray(data)

    if (!data.length) {
      return
    }

    const includesAndIds: CumulatedIncludeAndIds[] = []

    for (const include of cumulatedIncludes) {
      let ids: Set<Id> | undefined = undefined

      for (const item of data) {
        const id = get(item, include.keyHere!) as Id | Id[] | null | undefined
        if (id == null) {
          set(item, include.nameAs, noRelation(include))
          continue
        }

        if (!ids) {
          ids = new Set()
        }

        for (const currentId of toArray(id)) {
          ids.add(currentId)
        }
      }

      if (ids) {
        includesAndIds.push({ include, ids: [...ids] })
      }
    }

    const promises: Promise<CumulatedRequestResult>[] = []

    for (const includeAndIds of includesAndIds) {
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
          set(item, include.nameAs, noRelation(include))
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
          set(item, include.nameAs, noRelation(include))
        }
      })
      promisesPerIncludeAndItem.push(...promisesPerItem)
    })

    await Promise.all(promisesPerIncludeAndItem)
  }
}
