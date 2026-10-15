import type { PopulateObject, ShallowPopulateOptions } from '../types.js'

export const shouldCatchOnError = (
  options: Partial<Pick<ShallowPopulateOptions, 'catchOnError'>>,
  include: PopulateObject,
): boolean => {
  if (include.catchOnError !== undefined) return !!include.catchOnError
  if (options.catchOnError !== undefined) return !!options.catchOnError
  return false
}
