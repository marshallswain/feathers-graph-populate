import type { PopulateObject } from '../types.js'

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
