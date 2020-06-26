
/* eslint quotes: 0 */
// Defines Mongoose model for service `posts`.
const merge = require('lodash.merge')
// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose')



let moduleExports = merge({},

  {
    title: String,
    authorId: mongoose.Schema.Types.ObjectId
  },


)


module.exports = moduleExports



