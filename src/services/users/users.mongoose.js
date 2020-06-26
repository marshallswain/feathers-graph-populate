/* eslint quotes: 0 */
// Defines Mongoose model for service `users`.
const merge = require('lodash.merge');
/* eslint no-unused-vars:0 */
const mongoose = require('mongoose');

let moduleExports = merge(
  {},
  {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
  }
);

module.exports = moduleExports;
