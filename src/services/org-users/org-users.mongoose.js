/* eslint quotes: 0 */
// Defines Mongoose model for service `orgUsers`.
const merge = require('lodash.merge');
/* eslint no-unused-vars:0 */
const mongoose = require('mongoose');

let moduleExports = merge(
  {},

  {
    userId: mongoose.Schema.Types.ObjectId,
    userFirstName: String,
    userLastName: String,
    orgId: mongoose.Schema.Types.ObjectId,
    orgName: String,
  }
);

module.exports = moduleExports;
