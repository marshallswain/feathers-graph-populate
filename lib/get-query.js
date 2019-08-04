const { get, unset } = require('lodash')

/**
 * getPopulateQuery is a helper utility for the populate hook, which performs the following:
 * 1. Security - it makes sure that external requests can only pass a $populateParams.name, since
 *    providing a $populateParams.query from an external source opens up too many potential data leaks.
 * 2. Consistency - it makes sure the the $populateParams.query is always available to the populate hook,
 *    whenever applicable.
 */
module.exports = function getPopulateQuery({ context, namedQueries, defaultQueryName }) {
  let query = get(context, 'params.$populateParams.query')

  // Remove any possible $populateParams.query passed from the outside
  if (context.params.provider) {
    unset(context, 'params.$populateParams.query')
  }

  if (!query || context.params.provider) {
    // Set the query based on any $populateParams.name passed from the outside
    const paramsName = get(context, 'params.$populateParams.name') || defaultQueryName
    query = get(namedQueries, `${paramsName}.query`) || namedQueries[paramsName]
  }
  return query
}
