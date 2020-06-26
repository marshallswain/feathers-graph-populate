
/* eslint quotes: 0 */
// Defines Mongoose model for service `comments`.
const merge = require('lodash.merge')
// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose')

let moduleExports = merge({},
  {
    text: String,
    userId: mongoose.Schema.Types.ObjectId,
    userFirstName: String,
    userLastName: String,
    postId: mongoose.Schema.Types.ObjectId
  },
)

module.exports = moduleExports
