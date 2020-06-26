// Initializes the `comments` service on path `/comments`.
const createService = require('feathers-nedb');
const createModel = require('../../models/comments.model');
const hooks = require('./comments.hooks');

let moduleExports = function (app) {
  let Model = createModel(app);
  let paginate = app.get('paginate');

  let options = {
    Model,
    paginate,
    multi: true,
  };

  // Initialize our service with any options it requires
  app.use('/comments', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('comments');

  service.hooks(hooks);
};

module.exports = moduleExports;
