
/* eslint quotes: 0 */
// Defines Mongoose model for service `groupUsers`. (Can be re-generated.)
const merge = require('lodash.merge')
// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose')
// !code: imports // !end
// !code: init // !end

let moduleExports = merge({},
  // !<DEFAULT> code: model
  {
    userId: mongoose.Schema.Types.ObjectId,
    userFirstName: String,
    userLastName: String,
    orgId: mongoose.Schema.Types.ObjectId,
    orgName: String,
    groupId: mongoose.Schema.Types.ObjectId,
    groupName: String
  },
  // !end
  // !code: moduleExports // !end
)

// !code: exports // !end
module.exports = moduleExports

// !code: funcs // !end
// !code: end // !end
