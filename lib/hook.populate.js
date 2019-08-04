const deepPopulate = require('./deep-populate')
const getQuery = require('./get-query')
const { set } = require('lodash')
/**
 * $populateParams.name can be passed from the outside.
 * $populateParams.query can be directly used, internally.
 */
module.exports = function setupPopulateHook(options = {}) {
  const { namedQueries, defaultQueryName, populates } = options

  return async function populateFormFeedback(context) {
    // Skip this hook if there are no $populateParams or defaultQueryName
    if(!context.params.$populateParams && !defaultQueryName) {
      return Promise.resolve(context)
    }
    /**
     * The `getQuery` function sets up params.$populateParams.query.
     */
    set(context, 'params.$populateParams.query', getQuery({ context, defaultQueryName, namedQueries }))

    /**
     * The deepPopulate hook expects to find a query at params.$populateParams.query
     */
    return deepPopulate({ populates })(context)
  }
}