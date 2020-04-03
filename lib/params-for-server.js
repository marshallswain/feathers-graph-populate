/**
 * paramsForServer('$populateParams')
 *
 * In the request, the provided keys will be prepended with an underscore to prevent
 * requiring to add them to the feathers whitelist.
 */
module.exports = function paramsForServer(...whitelist) {
  return context => {
    // Prevent directly modifying the params, which would break the find getters.
    const params = JSON.parse(JSON.stringify(context.params))

    params.query = params.query || {}
    params.query._$client = params.query._$client || {}

    Object.keys(params).forEach(key => {
      if (key !== 'query') {
        if (whitelist.includes(key)) {
          params.query._$client[`_${key}`] = params[key]
          delete context.params[key]
        }
      }
    })
    context.params = params
  }
}
