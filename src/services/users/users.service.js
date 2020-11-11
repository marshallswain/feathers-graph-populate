// Initializes the `users` service on path `/users`.
const createService = require('feathers-nedb');
const createModel = require('../../models/users.model');
const hooks = require('./users.hooks');
const graphPopulate = require('./users.graph-populate')

let moduleExports = function (app) {
  let Model = createModel(app);
  let paginate = app.get('paginate');

  let options = {
    Model,
    paginate,
    multi: true,
    graphPopulate
  };

  app.use('/users', createService(options));

  const service = app.service('users');

  service.hooks(hooks);
};

module.exports = moduleExports;
