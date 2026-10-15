import type { HookContext, Params } from '@feathersjs/feathers'
import { mergeQuery } from 'feathers-utils/utils'
import type { ChainedParamsOptions, GraphPopulateParams } from '../types.js'

/**
 * Merges `source` into `target` shallowly. `query` is merged with `mergeQuery`
 * in `intersect` mode, so later params can only narrow the query: conflicting
 * properties must both match (`$and`) and `$select` is intersected.
 */
const mergeParams = (target: Params, source: Params): Params => {
  const { query, ...rest } = source
  const merged: Params = { ...target, ...rest }
  if (query !== undefined) {
    merged.query = target.query
      ? mergeQuery(target.query, query, { mode: 'intersect' })
      : { ...query }
  }
  return merged
}

export const chainedParams = async (
  paramsArr: GraphPopulateParams,
  context: HookContext,
  target: any,
  options: ChainedParamsOptions = {},
): Promise<Params | undefined> => {
  const arr = Array.isArray(paramsArr) ? paramsArr : [paramsArr]
  const { thisKey, skipWhenUndefined } = options

  let resultingParams: Params = {}
  for (let i = 0, n = arr.length; i < n; i++) {
    let params: Params | void | undefined
    const current = arr[i]
    if (typeof current === 'function') {
      const fn = current as (
        params: Params,
        context: HookContext,
        target: any,
      ) => void | Params | Promise<void | Params>
      params =
        thisKey == null
          ? fn(resultingParams, context, target)
          : fn.call(thisKey, resultingParams, context, target)
      params = await Promise.resolve(params)
    } else {
      params = current
    }
    if (!params && skipWhenUndefined) return undefined
    if (params && params !== resultingParams) {
      resultingParams = mergeParams(resultingParams, params)
    }
  }

  return resultingParams
}
