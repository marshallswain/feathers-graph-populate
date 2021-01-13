import { Query } from '@feathersjs/feathers'
import _get from 'lodash/get'
import _unset from 'lodash/unset'
import { GetPopulateQueryOptions } from '../types'

/**
 * getPopulateQuery is a helper utility for the populate hook, which performs the following:
 * 1. Security - it makes sure that external requests can only pass a $populateParams.name, since
 *    providing a $populateParams.query from an external source opens up too many potential data leaks.
 * 2. Consistency - it makes sure the the $populateParams.query is always available to the populate hook,
 *    whenever applicable.
 */
export default function getPopulateQuery(options: GetPopulateQueryOptions): Query {
  const { context, namedQueries, defaultQueryName } = options
  let query = _get(context, 'params.$populateParams.query')

  // Remove any possible $populateParams.query passed from the outside
  if (context.params.provider) {
    _unset(context, 'params.$populateParams.query')
  }

  if (!query || context.params.provider) {
    // Set the query based on any $populateParams.name passed from the outside
    const paramsName = _get(context, 'params.$populateParams.name') || defaultQueryName
    query = _get(namedQueries, `${paramsName}.query`) || namedQueries[paramsName]
  }
  return query
}
