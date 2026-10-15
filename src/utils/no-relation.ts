import type { PopulateObject } from '../types.js'

export const noRelation = (include: PopulateObject) => {
  return include.asArray ? [] : null
}
