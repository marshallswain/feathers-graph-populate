
// Initializes the `orgUsers` service on path `/org-users`.
const createService = require('feathers-nedb')
const createModel = require('../../models/org-users.model')
const hooks = require('./org-users.hooks')



let moduleExports = function (app) {
  let Model = createModel(app)
  let paginate = app.get('paginate')


  let options = {
    Model,
    paginate,
    multi: true
  }


  // Initialize our service with any options it requires

  app.use('/org-users', createService(options))


  // Get our initialized service so that we can register hooks
  const service = app.service('org-users')

  service.hooks(hooks)

}


module.exports = moduleExports



