import graphPopulate from './graph-populate'
import getQuery from './get-query'
import _set from 'lodash/set'
import { HookContext } from '@feathersjs/feathers'
import { PopulateOptions } from './types'
/**
 * $populateParams.name can be passed from the outside.
 * $populateParams.query can be directly used, internally.
 */
export default function setupPopulateHook(options: PopulateOptions): ((context: HookContext) => Promise<HookContext>) {
  const { namedQueries, defaultQueryName, populates } = options

  return async function populateFormFeedback(context: HookContext): Promise<HookContext> {
    // Skip this hook if there are no $populateParams or defaultQueryName
    if(!context.params.$populateParams && !defaultQueryName) {
      return Promise.resolve(context)
    }
    /**
     * The `getQuery` function sets up params.$populateParams.query.
     */
    _set(context, 'params.$populateParams.query', getQuery({ context, defaultQueryName, namedQueries }))

    /**
     * The graphPopulate hook expects to find a query at params.$populateParams.query
     */
    return graphPopulate({ populates })(context)
  }
}
