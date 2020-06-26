// Initializes the `posts` service on path `/posts`.
const createService = require('feathers-nedb');
const createModel = require('../../models/posts.model');
const hooks = require('./posts.hooks');

let moduleExports = function (app) {
  let Model = createModel(app);
  let paginate = app.get('paginate');

  let options = {
    Model,
    paginate,
    multi: true,
  };

  // Initialize our service with any options it requires

  app.use('/posts', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('posts');

  service.hooks(hooks);
};

module.exports = moduleExports;
