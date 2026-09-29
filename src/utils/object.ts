// Small, dependency-free replacements for the lodash helpers this package used to rely on.

const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype'])
const INDEX_REGEX = /^(?:0|[1-9]\d*)$/
const PATH_KEY_REGEX = /[^.[\]]+/g

const isIndex = (key: string): boolean => INDEX_REGEX.test(key)

const isObjectLike = (value: unknown): value is Record<PropertyKey, any> =>
  value !== null && typeof value === 'object'

/**
 * Splits a path like `a.b[0].c` into `['a', 'b', '0', 'c']`.
 * A key that exists verbatim on `obj` (e.g. `'a.b'`) is used as is.
 */
const toPath = (obj: unknown, path: string): string[] => {
  if (obj != null && path in Object(obj)) return [path]
  const keys = path.match(PATH_KEY_REGEX)
  return keys ?? [path]
}

export const get = (obj: unknown, path: string): any => {
  let current: any = obj
  for (const key of toPath(obj, path)) {
    if (current == null) return undefined
    current = current[key]
  }
  return current
}

/**
 * Sets `value` at `path` on `obj` (mutating it). Missing intermediate values are
 * created as arrays if the next key is an index, otherwise as objects.
 */
export const set = (obj: Record<string, any>, path: string, value: unknown) => {
  const keys = toPath(obj, path)
  if (keys.some((key) => UNSAFE_KEYS.has(key))) return obj

  let current: any = obj
  keys.forEach((key, i) => {
    if (i === keys.length - 1) {
      current[key] = value
      return
    }
    const next = current[key]
    current = current[key] =
      isObjectLike(next) || typeof next === 'function'
        ? next
        : isIndex(keys[i + 1])
          ? []
          : {}
  })

  return obj
}
