
// Initializes the `tasks` service on path `/tasks`.
const createService = require('feathers-nedb')
const createModel = require('../../models/tasks.model')
const hooks = require('./tasks.hooks')



let moduleExports = function (app) {
  let Model = createModel(app)
  let paginate = app.get('paginate')


  let options = {
    Model,
    paginate,
    multi: true
  }


  // Initialize our service with any options it requires

  app.use('/tasks', createService(options))


  // Get our initialized service so that we can register hooks
  const service = app.service('tasks')

  service.hooks(hooks)

}


module.exports = moduleExports



