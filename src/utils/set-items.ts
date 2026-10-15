import type { Params } from '@feathersjs/feathers'
import { dequal } from 'dequal'
import type { AnyData, IncludeCumulated } from '../types.js'
import { noRelation } from './no-relation.js'
import { get, set } from './object.js'
import { toArray } from './to-array.js'

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

  // Index the related items once instead of scanning all of them for every item
  const index = indexRelatedItems(relatedItems, keyThere, !!asArray)

  data.forEach((item) => {
    const keyHere = get(item, include.keyHere!) as
      (string | number) | (string | number)[]

    if (keyHere === undefined) return

    if (Array.isArray(keyHere)) {
      if (!asArray) {
        const found = getRelatedItems(keyHere[0], index, include, params)
        if (found !== undefined) {
          set(item, nameAs, stripResult(found))
        }
      } else {
        set(
          item,
          nameAs,
          stripResult(getRelatedItems(keyHere, index, include, params)),
        )
      }
    } else {
      const found = getRelatedItems(keyHere, index, include, params)
      if (found !== undefined) {
        set(item, nameAs, stripResult(found))
      }
    }
  })
}

type GetRelatedItemsResult = AnyData | AnyData[] | null

type RelatedItemsIndex = {
  items: AnyData[]
  /** The `keyThere` value of every related item, read once. */
  keys: unknown[]
  /** Primitive key -> ascending positions of the related items it matches. */
  byKey: Map<unknown, number[]>
  /**
   * Positions of related items whose key is a non-array object. `dequal` can
   * still match those against a primitive id, so they are always checked.
   */
  objectKeys: number[]
}

const isPrimitive = (value: unknown): boolean =>
  value === null || (typeof value !== 'object' && typeof value !== 'function')

/**
 * Returns a function that reads `keyThere` from a related item.
 * Allows populating on nested array of objects like key[0].name, key[1].name:
 * if `keyThere` includes a dot and everything leading up to the first dot is an
 * array on the item, the rest of the path is read from every entry of that array.
 */
const keyThereReader = (keyThere: string): ((item: AnyData) => unknown) => {
  const dot = keyThere.indexOf('.')
  if (dot === -1) return (item) => get(item, keyThere)

  const arrayName = keyThere.slice(0, dot)
  const nestedProp = keyThere.slice(dot + 1)
  return (item) => {
    const array = item[arrayName]
    return Array.isArray(array)
      ? array.map((nestedItem) => get(nestedItem, nestedProp))
      : get(item, keyThere)
  }
}

const isMatch = (key: unknown, id: unknown, asArray: boolean): boolean =>
  asArray
    ? (Array.isArray(key) && key.includes(id)) || dequal(key, id)
    : dequal(key, id)

function indexRelatedItems(
  items: AnyData[],
  keyThere: string,
  asArray: boolean,
): RelatedItemsIndex {
  const readKey = keyThereReader(keyThere)
  const keys: unknown[] = []
  const byKey = new Map<unknown, number[]>()
  const objectKeys: number[] = []

  // `Map` compares keys with SameValueZero, which is what `dequal` and
  // `includes` do for primitives
  const add = (key: unknown, position: number): void => {
    const positions = byKey.get(key)
    if (positions === undefined) byKey.set(key, [position])
    else if (positions.at(-1) !== position) positions.push(position)
  }

  for (let i = 0, n = items.length; i < n; i++) {
    const key = readKey(items[i])
    keys.push(key)
    if (isPrimitive(key)) {
      add(key, i)
    } else if (Array.isArray(key)) {
      // A primitive id only matches an array key through `includes` (asArray)
      if (asArray) {
        for (let j = 0, m = key.length; j < m; j++) {
          if (isPrimitive(key[j])) add(key[j], i)
        }
      }
    } else {
      objectKeys.push(i)
    }
  }

  return { items, keys, byKey, objectKeys }
}

const NO_MATCHES: number[] = []

/** Ascending positions of the related items that match `id`. */
const findMatches = (
  index: RelatedItemsIndex,
  id: unknown,
  asArray: boolean,
): number[] => {
  const { keys, byKey, objectKeys } = index

  if (!isPrimitive(id)) {
    // Object ids (e.g. ObjectId, Date) can only be compared with `dequal`
    const matches: number[] = []
    for (let i = 0, n = keys.length; i < n; i++) {
      if (isMatch(keys[i], id, asArray)) matches.push(i)
    }
    return matches
  }

  const matches = byKey.get(id) ?? NO_MATCHES
  if (!objectKeys.length) return matches

  const objectMatches = objectKeys.filter((i) => isMatch(keys[i], id, asArray))
  return objectMatches.length
    ? [...matches, ...objectMatches].sort((a, b) => a - b)
    : matches
}

function getRelatedItems(
  ids: (string | number) | (string | number)[],
  index: RelatedItemsIndex,
  include: IncludeCumulated,
  params: Params | undefined,
): GetRelatedItemsResult {
  const asArray = !!include.asArray
  const skip = params?.query?.$skip ?? 0
  const limit = params?.query?.$limit ?? Infinity
  ids = toArray(ids)

  // Matches in related-items order, once per matching id
  let matches: number[]
  if (ids.length === 1) {
    matches = findMatches(index, ids[0], asArray)
  } else {
    matches = []
    for (let j = 0, m = ids.length; j < m; j++) {
      const idMatches = findMatches(index, ids[j], asArray)
      for (let k = 0, n = idMatches.length; k < n; k++) {
        matches.push(idMatches[k])
      }
    }
    matches.sort((a, b) => a - b)
  }

  let skipped = 0
  const itemOrItems: GetRelatedItemsResult = noRelation(include)

  for (let k = 0, n = matches.length; k < n; k++) {
    if (skipped < skip) {
      skipped++
      continue
    }
    const currentItem = index.items[matches[k]]
    if (!asArray) return currentItem

    const items = itemOrItems as AnyData[]
    items.push(currentItem)
    if (items.length >= limit) break
  }

  return itemOrItems
}
