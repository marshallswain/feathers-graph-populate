
// Configure the Feathers services.
let comments = require('./comments/comments.service')
let groupUsers = require('./group-users/group-users.service')
let groups = require('./groups/groups.service')
let orgUsers = require('./org-users/org-users.service')
let orgs = require('./orgs/orgs.service')
let posts = require('./posts/posts.service')
let tasks = require('./tasks/tasks.service')
let users = require('./users/users.service')




// eslint-disable-next-line no-unused-vars
let moduleExports = function (app) {
  app.configure(comments)
  app.configure(groupUsers)
  app.configure(groups)
  app.configure(orgUsers)
  app.configure(orgs)
  app.configure(posts)
  app.configure(tasks)
  app.configure(users)

}


module.exports = moduleExports



