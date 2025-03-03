import _set from 'lodash/set.js'

import { graphPopulate } from './graph-populate.hook'
import { getQuery } from '../utils/get-query'

import type { HookContext } from '@feathersjs/feathers'

import type { PopulateHookOptions, GraphPopulateHookOptions } from '../types'
/**
 * $populateParams.name can be passed from the outside.
 * $populateParams.query can be directly used, internally.
 */
export function populate(
  options: PopulateHookOptions,
): (context: HookContext) => Promise<HookContext> {
  const {
    namedQueries,
    defaultQueryName,
    populates,
    allowUnnamedQueryForExternal,
  } = options

  return async (context: HookContext): Promise<HookContext> => {
    // Skip this hook if there are no $populateParams or defaultQueryName
    if (!context.params.$populateParams && !defaultQueryName) {
      return Promise.resolve(context)
    }
    /**
     * The `getQuery` function sets up params.$populateParams.query.
     */
    _set(
      context,
      'params.$populateParams.query',
      getQuery({
        context,
        defaultQueryName,
        namedQueries,
        allowUnnamedQueryForExternal,
      }),
    )

    /**
     * The graphPopulate hook expects to find a query at params.$populateParams.query
     */
    return graphPopulate({ populates } as GraphPopulateHookOptions)(context)
  }
}
