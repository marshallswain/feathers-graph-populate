
// Configure the Feathers services. (Can be re-generated.)
let comments = require('./comments/comments.service')
let posts = require('./posts/posts.service')
let tasks = require('./tasks/tasks.service')
let users = require('./users/users.service')

// !code: imports // !end
// !code: init // !end

// eslint-disable-next-line no-unused-vars
let moduleExports = function (app) {
  app.configure(comments)
  app.configure(posts)
  app.configure(tasks)
  app.configure(users)
  // !code: func_return // !end
}

// !code: exports // !end
module.exports = moduleExports

// !code: funcs // !end
// !code: end // !end
