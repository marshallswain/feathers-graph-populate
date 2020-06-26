
// Initializes the `orgs` service on path `/orgs`.
const createService = require('feathers-nedb')
const createModel = require('../../models/orgs.model')
const hooks = require('./orgs.hooks')



let moduleExports = function (app) {
  let Model = createModel(app)
  let paginate = app.get('paginate')


  let options = {
    Model,
    paginate,
    multi: true
  }


  // Initialize our service with any options it requires

  app.use('/orgs', createService(options))


  // Get our initialized service so that we can register hooks
  const service = app.service('orgs')

  service.hooks(hooks)

}


module.exports = moduleExports



