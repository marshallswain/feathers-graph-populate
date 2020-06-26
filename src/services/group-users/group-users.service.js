// Initializes the `groupUsers` service on path `/group-users`.
const createService = require('feathers-nedb');
const createModel = require('../../models/group-users.model');
const hooks = require('./group-users.hooks');

let moduleExports = function (app) {
  let Model = createModel(app);
  let paginate = app.get('paginate');

  let options = {
    Model,
    paginate,
    multi: true,
  };

  // Initialize our service with any options it requires

  app.use('/group-users', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('group-users');

  service.hooks(hooks);
};

module.exports = moduleExports;
