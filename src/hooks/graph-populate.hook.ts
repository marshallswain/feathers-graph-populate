import _isEmpty from 'lodash/isEmpty.js'

import { shallowPopulate as makeShallowPopulate } from './shallow-populate.hook.js'

import type { HookContext, Params, Query } from '@feathersjs/feathers'

import type {
  Method,
  PopulateObject,
  Populates,
  SingleGraphPopulateParams,
} from '../types.js'
import type { GraphPopulateApplication } from '../app/graph-populate.class.js'

const FILTERS = ['$limit', '$select', '$skip', '$sort']

export interface GraphPopulateHookOptions<S = string> {
  populates: Populates<S>
  /**
   * @default: false
   */
  allowUnnamedQueryForExternal?: boolean
}

/**
 * Sets up the deepPopulate hook using the provided options.
 *  @param options
 *    @property populates - an object whose properties are named populates to pass to feathers-shallow-populate.
 *
 * The deepPopulate hook uses `feathers-shallow-populate` along with a lightweight,
 * GraphQL-like syntax to populate data between services.  It expects to find a query
 * object at `params.$populateParams.query`.
 */
export function graphPopulate(
  options: GraphPopulateHookOptions,
): (context: HookContext) => Promise<HookContext> {
  if (!options.populates) {
    throw new Error(
      'options.populates must be provided to the feathers-graph-populate hook',
    )
  }
  const { populates } = options

  return async (context: HookContext): Promise<HookContext> => {
    const populateQuery: Query | undefined =
      context.params?.$populateParams?.query

    if (!populateQuery) return context

    const { app } = context
    const graphPopulateApp: GraphPopulateApplication | undefined = (app as any)
      .graphPopulate

    // Get the populate data based on the query keys
    const keys = Object.keys(populateQuery)

    const currentPopulates = keys.reduce((currentPopulates, key) => {
      if (!populates[key]) return currentPopulates

      const currentQuery = { ...populateQuery[key] }

      const populate = populates[key]
      const service = app.service(populate.service)

      let params: SingleGraphPopulateParams[] = []
      if (populate.params) {
        if (Array.isArray(populate.params)) {
          params.push(...populate.params)
        } else {
          params.push(populate.params)
        }
      }

      if (!_isEmpty(currentQuery)) {
        const customKeysForQuery = (service as any).options?.graphPopulate
          ?.whitelist as string[] | undefined
        const extractKeys = [...FILTERS]

        if (customKeysForQuery) {
          extractKeys.push(...customKeysForQuery)
        }

        const paramsToAdd = Object.keys(currentQuery).reduce(
          (paramsToAdd, key) => {
            if (!extractKeys.includes(key)) return paramsToAdd
            const { query } = paramsToAdd
            query[key] = currentQuery[key]
            delete currentQuery[key]

            return paramsToAdd
          },
          { query: {} } as { query: Query },
        )
        params.push(paramsToAdd)
      }

      if (!_isEmpty(currentQuery)) {
        params.push({
          $populateParams: {
            query: currentQuery,
          },
        } as Params)
      }

      if (graphPopulateApp) {
        params = graphPopulateApp.withAppParams(
          params,
          context.method as Method,
          service,
        )
      }

      currentPopulates.push({
        ...populate,
        params,
      })

      return currentPopulates
    }, [] as PopulateObject[])

    if (!currentPopulates?.length) {
      return context
    }
    const shallowPopulate = makeShallowPopulate({ include: currentPopulates })
    const populatedContext = await shallowPopulate(context)
    return populatedContext
  }
}
