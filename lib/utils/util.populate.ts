import { graphPopulate } from '../hooks/graph-populate.hook'
import _isObject from 'lodash/isObject'

import type { HookContext } from '@feathersjs/feathers'

import type { PopulateParams, PopulateUtilOptions } from '../types'
/**
 * This is a utility (not a hook) which performs similar to the graph-populate hook.  It
 * is meant to be used INSIDE of a hook, because it requires the `context` object.
 * The difference is that when it puts its pants on in the morning, it makes gold records.
 * Just kidding, the real difference is that it is not a hook.  It can be used inside of
 * a hook to populate data a GraphQL-like query onto a record or array of records.
 */
export async function populateUtil(
  records: unknown[],
  options: PopulateUtilOptions,
): Promise<unknown[]> {
  const { app, params, populates } = options
  if (!app) {
    throw new Error('The app object must be provided in the populateUtil options.')
  }
  // If there's nothing to populate, return.
  if (!_isObject(params.$populateParams)) {
    return records
  }
  const $populateParams: PopulateParams = params.$populateParams
  const populateQuery = $populateParams.query
  if (!populates || !populateQuery || !Object.keys(populateQuery).length) {
    return records
  }

  const miniContext = {
    app,
    method: 'find',
    type: 'after',
    result: records,
    params,
  }
  const deepPopulate = graphPopulate({ populates })
  const populated = await deepPopulate(miniContext as HookContext)

  return populated.result
}
