import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _merge from 'lodash/merge'

import { shallowPopulate as makeShallowPopulate } from './shallow-populate.hook'

import type { HookContext, Query } from '@feathersjs/feathers'

import type { GraphPopulateHookOptions } from '../types'
import type { GraphPopulateApplication } from '../app/graph-populate.class'

const FILTERS = ['$limit', '$select', '$skip', '$sort']

/**
 * Sets up the deepPopulate hook using the provided options.
 *  @param options
 *    @property populates - an object whose properties are named populates to pass to feathers-shallow-populate.
 *
 * The deepPopulate hook uses `feathers-shallow-populate` along with a lightweight,
 * GraphQL-like syntax to populate data between services.  It expects to find a query
 * object at `params.$populateParams.query`.
 */
export function graphPopulate(options: GraphPopulateHookOptions): ((context: HookContext) => Promise<HookContext>) {
  if (!options.populates) {
    throw new Error('options.populates must be provided to the feathers-graph-populate hook')
  }
  const { populates } = options

  return async function deepPopulateHook(context: HookContext): Promise<HookContext> {
    const populateQuery: Query|undefined = _get(context, 'params.$populateParams.query')

    if (!populateQuery) return context

    const { app } = context
    const graphPopulateApp: GraphPopulateApplication| undefined = app.graphPopulate


    // Get the populate data based on the query keys
    const keys = Object.keys(populateQuery)

    const currentPopulates = keys.reduce((currentPopulates, key) => {
      if (!populates[key]) return currentPopulates

      const currentQuery = Object.assign({}, populateQuery[key])

      const populate = populates[key]
      const service = app.service(populate.service)

      let params = []
      if (populate.params) {
        if (Array.isArray(populate.params)) {
          params.push(...populate.params)
        } else {
          params.push(populate.params)
        }
      }

      if (!_isEmpty(currentQuery)) {
        const customKeysForQuery: string[]|undefined = _get(service, 'options.graphPopulate.whitelist')
        const extractKeys = [...FILTERS]
        if (customKeysForQuery) {
          extractKeys.push(...customKeysForQuery)
        }
        const paramsToAdd = Object.keys(currentQuery)
          .reduce((paramsToAdd, key) => {
            if (!extractKeys.includes(key)) return paramsToAdd
            const { query } = paramsToAdd
            _merge(query, { [key]: currentQuery[key] })
            delete currentQuery[key]
            return paramsToAdd
          }, { query: {} })
        params.push(paramsToAdd)
      }

      if (!_isEmpty(currentQuery)) {
        params.push({
          $populateParams: {
            query: currentQuery
          }
        })
      }

      if (graphPopulateApp) {
        params = graphPopulateApp.withAppParams(params, context.method, service)
      }

      currentPopulates.push(Object.assign({}, populate, { params }))

      return currentPopulates
    }, [])

    if (!currentPopulates || !currentPopulates.length) {
      return context
    }
    const shallowPopulate = makeShallowPopulate({ include: currentPopulates })
    const populatedContext = await shallowPopulate(context)
    return populatedContext
  }
}
