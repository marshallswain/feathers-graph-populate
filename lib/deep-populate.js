const { shallowPopulate: makeShallowPopulate } = require('feathers-shallow-populate')
const { get } = require('lodash')

/**
 * Sets up the deepPopulate hook using the provided options.
 *  @param options
 *    @property populates - an object whose properties are named populates to pass to feathers-shallow-populate.
 *
 * The deepPopulate hook uses `feathers-shallow-populate` along with a lightweight,
 * GraphQL-like syntax to populate data between services.  It expects to find a query
 * object at `params.$populateParams.query`.
 */
module.exports = function setupDeepPopulateHook(options) {
  if (!options.populates) {
    throw new Error('options.populates must be provided to the deep-populate hook')
  }
  const populatesForThisService = options.populates

  return async function deepPopulateHook(context) {
    const populateQuery = get(context, 'params.$populateParams.query')

    if (populateQuery) {
      // Get the populate data based on the query keys
      const populates = Object.keys(populateQuery)
        .filter(key => populatesForThisService[key])
        .map(key => {
          const currentQuery = populateQuery[key]
          const data = options.populates[key]
          data.params = data.params || {}

          Object.assign(data.params, {
            $populateParams: {
              query: currentQuery
            }
          })
          return data
        })
      if (!populates || !populates.length) {
        return context
      }
      const shallowPopulate = makeShallowPopulate({ include: populates })
      const populatedContext = await shallowPopulate(context)
      return populatedContext
    } else {
      return context
    }
  }
}