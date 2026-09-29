import type { Application, HookContext, Id, Params } from '@feathersjs/feathers'
import { dequal } from 'dequal'
import { mergeQuery } from 'feathers-utils/utils'
import type {
  AnyData,
  ChainedParamsOptions,
  CumulatedRequestResult,
  GraphPopulateParams,
  IncludeCumulated,
  PopulateObject,
  ShallowPopulateOptions,
} from '../types.js'
import { get, set } from './object.js'
import { toArray } from './to-array.js'

const requiredIncludeAttrs = ['service', 'nameAs', 'asArray', 'params']

const isDynamicParams = (
  params: Params | Params[] | (() => any) | undefined,
): boolean => {
  if (!params) return false
  if (Array.isArray(params)) {
    return params.some((p) => isDynamicParams(p))
  } else {
    return typeof params === 'function' || Object.keys(params).length > 0
  }
}

export const shouldCatchOnError = (
  options: Partial<Pick<ShallowPopulateOptions, 'catchOnError'>>,
  include: PopulateObject,
): boolean => {
  if (include.catchOnError !== undefined) return !!include.catchOnError
  if (options.catchOnError !== undefined) return !!options.catchOnError
  return false
}

const describeInclude = (
  include: Partial<PopulateObject>,
  index: number,
): string => {
  const nameAs = include.nameAs ? `nameAs="${include.nameAs}"` : null
  const service = include.service ? `service="${include.service}"` : null
  const parts = [nameAs, service].filter(Boolean).join(' ')
  return parts ? `${parts} (index ${index})` : `index ${index}`
}

export const applyIncludeDefaults = (includes: PopulateObject[]): void => {
  for (const include of includes) {
    if (!('asArray' in include)) {
      include.asArray = true
    }
    if (!('params' in include)) {
      include.params = {}
    }
    if (!('requestPerItem' in include)) {
      include.requestPerItem =
        !('keyHere' in include) && !('keyThere' in include)
    }
  }
}

export const assertIncludes = (includes: PopulateObject[]): void => {
  includes.forEach((include, index) => {
    const isDynamic = isDynamicParams(include.params)

    const requiredAttrs = isDynamic
      ? requiredIncludeAttrs
      : [...requiredIncludeAttrs, 'keyHere', 'keyThere']

    requiredAttrs.forEach((attr) => {
      if (!(attr in include)) {
        throw new Error(
          `shallowPopulate hook: include ${describeInclude(include, index)} is missing required attribute \`${attr}\`. Every include must contain \`service\`, \`nameAs\` and (\`keyHere\` and \`keyThere\`) or \`params\`.`,
        )
      }
    })

    if (
      isDynamic &&
      ((!('keyHere' in include) && 'keyThere' in include) ||
        ('keyHere' in include && !('keyThere' in include)))
    ) {
      throw new Error(
        `shallowPopulate hook: include ${describeInclude(include, index)} defines only one of \`keyHere\`/\`keyThere\`. Both must be set together.`,
      )
    }
  })

  const seen = new Map<string, number>()
  includes.forEach((include, index) => {
    const previous = seen.get(include.nameAs)
    if (previous !== undefined) {
      throw new Error(
        `shallowPopulate hook: duplicate \`nameAs="${include.nameAs}"\` at index ${index} (first defined at index ${previous}). Every include must have a unique \`nameAs\`.`,
      )
    }
    seen.set(include.nameAs, index)
  })
}

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

export type CumulatedIncludeAndIds = { include: IncludeCumulated; ids: Id[] }

export async function makeCumulatedRequest(
  app: Application,
  { include, ids }: CumulatedIncludeAndIds,
  context: HookContext,
): Promise<CumulatedRequestResult> {
  const { keyThere } = include

  let params = {
    query: {
      [keyThere!]: ids.length === 1 ? ids[0] : { $in: ids },
    },
    paginate: false,
  } as Params

  const service = app.service(include.service)

  const target = {
    path: include.service,
    service,
  }

  params = (await chainedParams(
    [params, ...toArray(include.params)],
    context,
    target,
  )) as Params

  // modify params & rm $skip & $m $limit

  const { $skip, $limit, ...query } = params.query ? { ...params.query } : {}

  // if $select hasn't ${keyThere} add it and delete it afterwards
  if (query.$select && !query.$select.includes(keyThere)) {
    query.$select = [...query.$select, keyThere]
  }

  const response = await service.find({ ...params, query })

  return {
    include,
    params,
    response,
  }
}

export async function makeRequestPerItem(
  item: AnyData,
  app: Application,
  include: PopulateObject,
  context: HookContext,
): Promise<void> {
  const { nameAs, asArray } = include
  const paramsFromInclude = toArray(include.params)

  const paramsOptions = {
    thisKey: item,
    skipWhenUndefined: true,
  }

  const service = app.service(include.service)

  const target = {
    path: include.service,
    service,
  }

  const params = await chainedParams(
    [{ paginate: false } as Params, ...paramsFromInclude],
    context,
    target,
    paramsOptions,
  )

  if (!params) {
    set(item, nameAs, noRelation(include))

    return
  }
  const relatedItems = await service.find(params)

  if (asArray) {
    set(item, nameAs, relatedItems)
  } else {
    const relatedItem = relatedItems.length > 0 ? relatedItems[0] : null
    set(item, nameAs, relatedItem)
  }
}

export function setItems(
  data: AnyData[],
  include: IncludeCumulated,
  params: Params | undefined,
  relatedItems: AnyData[],
): void {
  const { nameAs, keyThere, asArray } = include

  // keyThere was force-added to $select in makeCumulatedRequest so we could
  // match. If the user did not ask for it, strip it from the items we attach —
  // but on a clone, so the upstream service response stays untouched.
  const stripKeyThere = !!(
    params?.query?.$select && !params.query.$select.includes(keyThere)
  )
  const strip = (item: AnyData): AnyData => {
    if (!stripKeyThere) return item
    const { [keyThere]: _omit, ...rest } = item
    return rest
  }
  const stripResult = (
    result: GetRelatedItemsResult,
  ): GetRelatedItemsResult => {
    if (!stripKeyThere || result == null) return result
    return Array.isArray(result) ? result.map(strip) : strip(result)
  }

  data.forEach((item) => {
    const keyHere = get(item, include.keyHere!) as
      (string | number) | (string | number)[]

    if (keyHere === undefined) return

    if (Array.isArray(keyHere)) {
      if (!asArray) {
        const found = getRelatedItems(keyHere[0], relatedItems, include, params)
        if (found !== undefined) {
          set(item, nameAs, stripResult(found))
        }
      } else {
        set(
          item,
          nameAs,
          stripResult(getRelatedItems(keyHere, relatedItems, include, params)),
        )
      }
    } else {
      const found = getRelatedItems(keyHere, relatedItems, include, params)
      if (found !== undefined) {
        set(item, nameAs, stripResult(found))
      }
    }
  })
}

type GetRelatedItemsResult = AnyData | AnyData[] | null

export function getRelatedItems(
  ids: (string | number) | (string | number)[],
  relatedItems: AnyData[],
  include: IncludeCumulated,
  params: Params | undefined,
): GetRelatedItemsResult {
  const { keyThere } = include
  const skip = params?.query?.$skip ?? 0
  const limit = params?.query?.$limit ?? Infinity
  ids = toArray(ids)
  let skipped = 0
  let itemOrItems: GetRelatedItemsResult = noRelation(include)

  let isDone = false
  for (let i = 0, n = relatedItems.length; i < n; i++) {
    if (isDone) break
    const currentItem = relatedItems[i]

    for (let j = 0, m = ids.length; j < m; j++) {
      const id = ids[j]
      let currentId
      // Allow populating on nested array of objects like key[0].name, key[1].name
      // If keyThere includes a dot, we're looking for a nested prop. This checks if that nested prop is an array.
      // If it's an array, we assume it to be an array of objects.
      // It splits the key only on the first dot which allows populating on nested keys inside the array of objects.
      if (
        keyThere.includes('.') &&
        Array.isArray(currentItem[keyThere.slice(0, keyThere.indexOf('.'))])
      ) {
        // The name of the array is everything leading up to the first dot.
        const arrayName = keyThere.split('.')[0]
        // The rest will be handed to getByDot as the path to the prop
        const nestedProp = keyThere.slice(keyThere.indexOf('.') + 1)
        // Map over the array to grab each nestedProp's value.
        currentId = (currentItem[arrayName] as AnyData[]).map((nestedItem) => {
          const keyThereVal = get(nestedItem, nestedProp)
          return keyThereVal
        })
      } else {
        const keyThereVal = get(currentItem, keyThere)
        currentId = keyThereVal
      }
      if (include.asArray) {
        const items = itemOrItems as AnyData[]
        if (
          (Array.isArray(currentId) && currentId.includes(id)) ||
          dequal(currentId, id)
        ) {
          if (skipped < skip) {
            skipped++
            continue
          }
          items.push(currentItem)
          if (items.length >= limit) {
            isDone = true
            break
          }
        }
      } else {
        if (dequal(currentId, id)) {
          if (skipped < skip) {
            skipped++
            continue
          }
          itemOrItems = currentItem
          isDone = true
          break
        }
      }
    }
  }

  return itemOrItems
}

export const noRelation = (include: PopulateObject) => {
  return include.asArray ? [] : null
}
