const setupDeepPopulate = require('./graph-populate')
const lodash = require('lodash')

/**
 * This is a utility (not a hook) which performs similar to the graph-populate hook.  It
 * is meant to be used INSIDE of a hook, because it requires the `context` object.
 * The difference is that when it puts its pants on in the morning, it makes gold records.
 * Just kidding, the real difference is that it is not a hook.  It can be used inside of
 * a hook to populate data a GraphQL-like query onto a record or array of records.
 */
module.exports = async function populateUtil(records, { app, params, populates }) {
  if (!app) {
    throw new Error('The app object must be provided in the populateUtil options.')
  }
  // If there's nothing to populate, return.
  if (!lodash.isObject(params.$populateParams)) {
    return records
  }
  const { $populateParams } = params
  const populateQuery = $populateParams.query
  if (!populates || !populateQuery || !Object.keys(populateQuery).length) {
    return Promise.resolve(records)
  }

  const miniContext = {
    app,
    method: 'find',
    type: 'after',
    result: records,
    params
  }
  const deepPopulate = setupDeepPopulate({ populates })
  const populated = await deepPopulate(miniContext)

  return populated.result
}
