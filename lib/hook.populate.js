const deepPopulate = require('./deep-populate')
const getQuery = require('./get-query')
const { get, set } = require('lodash')
/**
 * $populateParams.name can be passed from the outside.
 * $populateParams.query can be directly used, internally.
 */
module.exports = function setupPopulateHook(options = {}) {
  const { namedQueries, defaultQueryName, populates } = options

  return async function populateFormFeedback(context) {
    set(context, 'params.$populateParams.query', getQuery({ context, defaultQueryName, namedQueries }))

    /**
     * The deepPopulate hook expects to find a query at params.$populateParams.query
     */
    return deepPopulate({ populates })(context)
  }
}