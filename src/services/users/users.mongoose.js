
/* eslint quotes: 0 */
// Defines Mongoose model for service `users`.
const merge = require('lodash.merge')
// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose')

let moduleExports = merge({},
  {
    firstName: String,
    lastName: String,
    email: String,
    password: String
  },
)

module.exports = moduleExports
