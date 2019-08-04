const { get, unset } = require('lodash')

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
