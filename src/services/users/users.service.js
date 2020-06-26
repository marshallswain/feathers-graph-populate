// Initializes the `users` service on path `/users`.
const createService = require('feathers-nedb');
const createModel = require('../../models/users.model');
const hooks = require('./users.hooks');

let moduleExports = function (app) {
  let Model = createModel(app);
  let paginate = app.get('paginate');

  let options = {
    Model,
    paginate,
    multi: true,
  };

  app.use('/users', createService(options));

  const service = app.service('users');

  service.hooks(hooks);
};

module.exports = moduleExports;
