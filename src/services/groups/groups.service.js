// Initializes the `groups` service on path `/groups`.
const createService = require('feathers-nedb');
const createModel = require('../../models/groups.model');
const hooks = require('./groups.hooks');

let moduleExports = function (app) {
  let Model = createModel(app);
  let paginate = app.get('paginate');

  let options = {
    Model,
    paginate,
    multi: true,
  };

  // Initialize our service with any options it requires

  app.use('/groups', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('groups');

  service.hooks(hooks);
};

module.exports = moduleExports;
