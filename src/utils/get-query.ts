import type { HookContext, Query } from '@feathersjs/feathers'
import type { GraphPopulateApplication } from '../app/graph-populate.class.js'
import { AnyData } from '../types.js'

export interface GetPopulateQueryOptions {
  context: HookContext
  namedQueries?: AnyData
  defaultQueryName?: string
  /**
   * @default: false
   */
  allowUnnamedQueryForExternal?: boolean
}

/**
 * getPopulateQuery is a helper utility for the populate hook, which performs the following:
 * 1. Security - it makes sure that external requests can only pass a $populateParams.name, since
 *    providing a $populateParams.query from an external source opens up too many potential data leaks.
 * 2. Consistency - it makes sure the the $populateParams.query is always available to the populate hook,
 *    whenever applicable.
 */
export function getQuery(options: GetPopulateQueryOptions): Query | undefined {
  const { context, namedQueries } = options
  let query = context.params?.$populateParams?.query

  // can be allowed by app globally or by hook explicitly
  // Both values can be undefined. So, if 'allowByHook' is undefined, it will be 'allowByApp'
  // If 'allowByApp' is undefined, it will be 'false'
  // If 'allowByHook' is set, it will be used and the 'allowByApp' will be ignored
  const allowByHook = options.allowUnnamedQueryForExternal
  const allowByApp = (
    (context.app as any).graphPopulate as GraphPopulateApplication
  )?.options?.allowUnnamedQueryForExternal

  // Remove any possible $populateParams.query passed from the outside
  if (query && context.params.provider && !(allowByHook ?? allowByApp)) {
    delete context.params.$populateParams.query
    query = undefined
  }

  if (!query) {
    if (!namedQueries) {
      return undefined
    }

    // Set the query based on any $populateParams.name passed from the outside
    const name =
      context.params?.$populateParams?.name || options.defaultQueryName

    if (!name) {
      return undefined
    }

    query = namedQueries[name]?.query || namedQueries[name]
  }

  return query
}
