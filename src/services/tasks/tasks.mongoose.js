/* eslint quotes: 0 */
// Defines Mongoose model for service `tasks`.
const merge = require('lodash.merge');
/* eslint no-unused-vars:0 */
const mongoose = require('mongoose');

let moduleExports = merge(
  {},

  {
    name: String,
    ownerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    childTaskIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        maxItems: 5,
      },
    ],
  }
);

module.exports = moduleExports;
