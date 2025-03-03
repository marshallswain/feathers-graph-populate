import type { Application, HookContext, Id, Params } from '@feathersjs/feathers'
import _get from 'lodash/get.js'
import _isEmpty from 'lodash/isEmpty.js'
import _isEqual from 'lodash/isEqual.js'
import _isFunction from 'lodash/isFunction.js'
import _merge from 'lodash/merge.js'
import _set from 'lodash/set.js'
import _uniqBy from 'lodash/uniqBy.js'
import type {
  AnyData,
  ChainedParamsOptions,
  CumulatedRequestResult,
  GraphPopulateParams,
  IncludeCumulated,
  PopulateObject,
  ShallowPopulateOptions,
} from '../types'
import { toArray } from './to-array.js'

const requiredIncludeAttrs = ['service', 'nameAs', 'asArray', 'params']

const isDynamicParams = (
  params: Params | Params[] | (() => any) | undefined,
): boolean => {
  if (!params) return false
  if (Array.isArray(params)) {
    return params.some((p) => isDynamicParams(p))
  } else {
    return !_isEmpty(params) || _isFunction(params)
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

export const assertIncludes = (includes: PopulateObject[]): void => {
  for (const include of includes) {
    // Create default `asArray` property
    if (!('asArray' in include)) {
      include.asArray = true
    }
    // Create default `params` property
    if (!('params' in include)) {
      include.params = {}
    }
    // Create default `requestPerItem` property
    if (!('requestPerItem' in include)) {
      include.requestPerItem =
        !('keyHere' in include) && !('keyThere' in include)
    }

    const isDynamic = isDynamicParams(include.params)

    const requiredAttrs = isDynamic
      ? requiredIncludeAttrs
      : [...requiredIncludeAttrs, 'keyHere', 'keyThere']

    requiredAttrs.forEach((attr) => {
      if (!(attr in include)) {
        throw new Error(
          'shallowPopulate hook: Every `include` must contain `service`, `nameAs` and (`keyHere` and `keyThere`) or `params` properties',
        )
      }
    })

    // if is dynamicParams and `keyHere` is defined, also `keyThere` must be defined
    if (
      isDynamic &&
      ((!('keyHere' in include) && 'keyThere' in include) ||
        ('keyHere' in include && !('keyThere' in include)))
    ) {
      throw new Error(
        'shallowPopulate hook: Every `include` with attribute `keyHere` or `keyThere` also needs the other attribute defined',
      )
    }

    if (
      include.requestPerItem &&
      ('keyHere' in include || 'keyThere' in include)
    ) {
      throw new Error(
        'shallowPopulate hook: The attributes `keyHere` and `keyThere` are useless when you set `requestPerItem: true`. You should remove these properties',
      )
    }
  }

  const uniqueNameAs = _uniqBy(includes, 'nameAs')
  if (uniqueNameAs.length !== includes.length) {
    throw new Error(
      'shallowPopulate hook: Every `ìnclude` must have a unique `nameAs` property',
    )
  }
}

export const chainedParams = async (
  paramsArr: GraphPopulateParams,
  context: HookContext,
  target: any,
  options: ChainedParamsOptions = {},
): Promise<Params> => {
  if (!Array.isArray(paramsArr)) paramsArr = [paramsArr]
  const { thisKey, skipWhenUndefined } = options

  const resultingParams: Params = {}
  for (let i = 0, n = paramsArr.length; i < n; i++) {
    let params = paramsArr[i]
    if (_isFunction(params)) {
      params =
        thisKey == null
          ? // @ts-expect-error todo
            params(resultingParams, context, target)
          : params.call(thisKey, resultingParams, context, target)
      params = await Promise.resolve(params)
    }
    if (!params && skipWhenUndefined) return undefined
    if (params !== resultingParams) _merge(resultingParams, params)
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

  params = await chainedParams(
    [params, ...toArray(include.params)],
    context,
    target,
  )

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
    _set(item, nameAs, noRelation(include))

    return
  }
  const relatedItems = await service.find(params)

  if (asArray) {
    _set(item, nameAs, relatedItems)
  } else {
    const relatedItem = relatedItems.length > 0 ? relatedItems[0] : null
    _set(item, nameAs, relatedItem)
  }
}

export function setItems(
  data: AnyData[],
  include: IncludeCumulated,
  params: Params,
  relatedItems: AnyData[],
): void {
  const { nameAs, keyThere, asArray } = include

  data.forEach((item) => {
    const keyHere = _get(item, include.keyHere!) as
      | (string | number)
      | (string | number)[]

    if (keyHere !== undefined) {
      if (Array.isArray(keyHere)) {
        if (!asArray) {
          const items = getRelatedItems(
            keyHere[0],
            relatedItems,
            include,
            params,
          )
          if (items !== undefined) {
            _set(item, nameAs, items)
          }
        } else {
          _set(
            item,
            nameAs,
            getRelatedItems(keyHere, relatedItems, include, params),
          )
        }
      } else {
        const items = getRelatedItems(keyHere, relatedItems, include, params)
        if (items !== undefined) {
          _set(item, nameAs, items)
        }
      }
    }
  })

  if (params.query?.$select && !params.query.$select.includes(keyThere)) {
    relatedItems.forEach((item) => {
      delete item[keyThere]
    })
  }
}

type GetRelatedItemsResult = AnyData | AnyData[] | null

export function getRelatedItems(
  ids: (string | number) | (string | number)[],
  relatedItems: AnyData[],
  include: IncludeCumulated,
  params: Params,
): GetRelatedItemsResult {
  const { keyThere } = include
  const skip = params.query?.$skip ?? 0
  const limit = params.query?.$limit ?? Math.max
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
          const keyThereVal = _get(nestedItem, nestedProp)
          return keyThereVal
        })
      } else {
        const keyThereVal = _get(currentItem, keyThere)
        currentId = keyThereVal
      }
      if (include.asArray) {
        const items = itemOrItems as AnyData[]
        if (
          (Array.isArray(currentId) && currentId.includes(id)) ||
          _isEqual(currentId, id)
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
        if (_isEqual(currentId, id)) {
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
