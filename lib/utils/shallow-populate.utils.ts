import type { Application, HookContext, Params } from '@feathersjs/feathers'
import _get from 'lodash/get'
import _has from 'lodash/has'
import _isEmpty from 'lodash/isEmpty'
import _isEqual from 'lodash/isEqual'
import _isFunction from 'lodash/isFunction'
import _merge from 'lodash/merge'
import _set from 'lodash/set'
import _uniqBy from 'lodash/uniqBy'
import type {
  AnyData,
  ChainedParamsOptions,
  CumulatedRequestResult,
  GraphPopulateParams,
  PopulateObject,
  ShallowPopulateOptions
} from '../types'

const requiredIncludeAttrs = [
  'service',
  'nameAs',
  'asArray',
  'params'
]

const isDynamicParams = (params) => {
  if (!params) return false
  if (Array.isArray(params)) {
    return params.some(p => isDynamicParams(p))
  } else {
    return !_isEmpty(params) || _isFunction(params)
  }
}

export const shouldCatchOnError = (
  options: Partial<Pick<ShallowPopulateOptions, 'catchOnError'>>,
  include: PopulateObject
): boolean => {
  if (include.catchOnError !== undefined) return !!include.catchOnError
  if (options.catchOnError !== undefined) return !!options.catchOnError
  return false
}

export const assertIncludes = (
  includes: PopulateObject[]
): void => {
  includes.forEach(include => {
    // Create default `asArray` property
    if (!_has(include, 'asArray')) {
      include.asArray = true
    }
    // Create default `params` property
    if (!_has(include, 'params')) {
      include.params = {}
    }
    // Create default `requestPerItem` property
    if (!_has(include, 'requestPerItem')) {
      include.requestPerItem = (!_has(include, 'keyHere') && !_has(include, 'keyThere'))
    }

    const isDynamic = isDynamicParams(include.params)

    const requiredAttrs = (isDynamic)
      ? requiredIncludeAttrs
      : [...requiredIncludeAttrs, 'keyHere', 'keyThere']

    requiredAttrs.forEach(attr => {
      if (!_has(include, attr)) {
        throw new Error('shallowPopulate hook: Every `include` must contain `service`, `nameAs` and (`keyHere` and `keyThere`) or `params` properties')
      }
    })

    // if is dynamicParams and `keyHere` is defined, also `keyThere` must be defined
    if (
      isDynamic &&
      Object.keys(include).filter(key => key === 'keyHere' || key === 'keyThere').length === 1
    ) {
      throw new Error('shallowPopulate hook: Every `include` with attribute `KeyHere` or `keyThere` also needs the other attribute defined')
    }

    if (include.requestPerItem && (_has(include, 'keyHere') || _has(include, 'keyThere'))) {
      throw new Error('shallowPopulate hook: The attributes `keyHere` and `keyThere` are useless when you set `requestPerItem: true`. You should remove these properties')
    }
  })

  const uniqueNameAs = _uniqBy(includes, 'nameAs')
  if (uniqueNameAs.length !== includes.length) {
    throw new Error('shallowPopulate hook: Every `ìnclude` must have a unique `nameAs` property')
  }
}

export const chainedParams = async (
  paramsArr: GraphPopulateParams,
  context: HookContext,
  target: Params,
  options: ChainedParamsOptions = {}
): Promise<Params> => {
  if (!paramsArr) return undefined
  if (!Array.isArray(paramsArr)) paramsArr = [paramsArr]
  const { thisKey, skipWhenUndefined } = options

  const resultingParams: Params = {}
  for (let i = 0, n = paramsArr.length; i < n; i++) {
    let params = paramsArr[i]
    if (_isFunction(params)) {
      params = (thisKey == null)
        ? params(resultingParams, context, target)
        : params.call(thisKey, resultingParams, context, target)
      params = await Promise.resolve(params)
    }
    if (!params && skipWhenUndefined) return undefined
    if (params !== resultingParams) _merge(resultingParams, params)
  }

  return resultingParams
}

export async function makeCumulatedRequest (
  app: Application,
  include: PopulateObject,
  dataMap: AnyData,
  context: HookContext
): Promise<CumulatedRequestResult> {
  const { keyHere, keyThere } = include

  let params: Params = { paginate: false }

  if (_has(include, 'keyHere') && _has(include, 'keyThere')) {
    const keyVals = dataMap[keyHere]
    let keysHere = Object.keys(keyVals) || []
    keysHere = keysHere.map(k => keyVals[k].key)
    Object.assign(params, { query: { [keyThere]: { $in: keysHere } } })
  }

  const paramsFromInclude = (Array.isArray(include.params))
    ? include.params
    : [include.params]

  const service = app.service(include.service)

  const target = {
    path: include.service,
    service
  }

  params = await chainedParams([params, ...paramsFromInclude], context, target)

  // modify params
  let query = params.query || {}

  query = Object.assign({}, query)

  // remove $skip to prevent unintended results and regard it afterwards
  if (query.$skip) { delete query.$skip }

  // remove $limit to prevent unintended results and regard it afterwards
  if (query.$limit) { delete query.$limit }

  // if $select hasn't ${keyThere} add it and delete it afterwards
  if (query.$select && !query.$select.includes(keyThere)) {
    query.$select = [...query.$select, keyThere]
  }

  const response = await service.find(Object.assign({}, params, { query }))

  return {
    include,
    params,
    response
  }
}

export async function makeRequestPerItem (
  item: AnyData,
  app: Application,
  include: PopulateObject,
  context: HookContext
): Promise<void> {
  const { nameAs, asArray } = include
  const paramsFromInclude = (Array.isArray(include.params))
    ? include.params
    : [include.params]

  const paramsOptions = {
    thisKey: item,
    skipWhenUndefined: true
  }

  const service = app.service(include.service)

  const target = {
    path: include.service,
    service
  }

  const params = await chainedParams([{ paginate: false }, ...paramsFromInclude], context, target, paramsOptions)

  if (!params) {
    (asArray)
      ? _set(item, nameAs, [])
      : _set(item, nameAs, null)
    return
  }
  const response = await service.find(params)
  const relatedItems = response.data || response

  if (asArray) {
    _set(item, nameAs, relatedItems)
  } else {
    const relatedItem = (relatedItems.length > 0) ? relatedItems[0] : null
    _set(item, nameAs, relatedItem)
  }
}

export function setItems (
  data: AnyData[],
  include: PopulateObject,
  params: Params,
  response: { data: AnyData[] } | AnyData[]
): void {
  const relatedItems = (Array.isArray(response)) ? response : response.data
  const { nameAs, keyThere, asArray } = include

  data.forEach(item => {
    const keyHere = _get(item, include.keyHere) as ((string | number) | (string | number)[])

    if (keyHere !== undefined) {
      if (Array.isArray(keyHere)) {
        if (!asArray) {
          const items = getRelatedItems(keyHere[0], relatedItems, include, params)
          if (items !== undefined) { _set(item, nameAs, items) }
        } else {
          _set(item, nameAs, getRelatedItems(keyHere, relatedItems, include, params))
        }
      } else {
        const items = getRelatedItems(keyHere, relatedItems, include, params)
        if (items !== undefined) { _set(item, nameAs, items) }
      }
    }
  })

  if (params.query.$select && !params.query.$select.includes(keyThere)) {
    relatedItems.forEach(item => {
      delete item[keyThere]
    })
  }
}

type GetRelatedItemsResult = AnyData | AnyData[] | undefined

export function getRelatedItems (
  ids: (string | number) | (string | number)[],
  relatedItems: AnyData[],
  include: PopulateObject,
  params: Params
): GetRelatedItemsResult {
  const { keyThere, asArray } = include
  const skip = _get(params, 'query.$skip', 0)
  const limit = _get(params, 'query.$limit', Math.max)
  ids = [].concat(ids || [])
  let skipped = 0
  let itemOrItems: GetRelatedItemsResult = (asArray) ? [] : undefined

  let isDone = false
  for (let i = 0, n = relatedItems.length; i < n; i++) {
    if (isDone) { break }
    const currentItem = relatedItems[i]

    for (let j = 0, m = ids.length; j < m; j++) {
      const id = ids[j]
      let currentId
      // Allow populating on nested array of objects like key[0].name, key[1].name
      // If keyThere includes a dot, we're looking for a nested prop. This checks if that nested prop is an array.
      // If it's an array, we assume it to be an array of objects.
      // It splits the key only on the first dot which allows populating on nested keys inside the array of objects.
      if (keyThere.includes('.') && Array.isArray(currentItem[keyThere.slice(0, keyThere.indexOf('.'))])) {
        // The name of the array is everything leading up to the first dot.
        const arrayName = keyThere.split('.')[0]
        // The rest will be handed to getByDot as the path to the prop
        const nestedProp = keyThere.slice(keyThere.indexOf('.') + 1)
        // Map over the array to grab each nestedProp's value.
        currentId = (currentItem[arrayName] as AnyData[]).map(nestedItem => {
          const keyThereVal = _get(nestedItem, nestedProp)
          return keyThereVal
        })
      } else {
        const keyThereVal = _get(currentItem, keyThere)
        currentId = keyThereVal
      }
      if (asArray) {
        if ((Array.isArray(currentId) && currentId.includes(id)) || _isEqual(currentId, id)) {
          if (skipped < skip) {
            skipped++
            continue
          }
          (itemOrItems as AnyData[]).push(currentItem)
          if (itemOrItems.length >= limit) {
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

export function mapDataWithId<T extends AnyData>(
  byKeyHere: T,
  key: string,
  keyHere: string,
  current: AnyData
): T {
  byKeyHere[key][keyHere] = byKeyHere[key][keyHere] || {
    key: keyHere,
    vals: []
  }
  byKeyHere
  byKeyHere[key][keyHere].vals.push(current)
  return byKeyHere
}
