
/* eslint quotes: 0 */
// Defines Sequelize model for service `comments`. (Can be re-generated.)
const merge = require('lodash.merge')
const Sequelize = require('sequelize')
// eslint-disable-next-line no-unused-vars
const DataTypes = Sequelize.DataTypes
// !code: imports // !end
// !code: init // !end

let moduleExports = merge({},
  // !<DEFAULT> code: sequelize_model
  {
    text: {
      type: DataTypes.TEXT
    },
    userId: {
      type: DataTypes.INTEGER
    },
    userFirstName: {
      type: DataTypes.TEXT
    },
    userLastName: {
      type: DataTypes.TEXT
    },
    postId: {
      type: DataTypes.INTEGER
    }
  },
  // !end
  // !code: moduleExports // !end
)

// !code: exports // !end
module.exports = moduleExports

// !code: funcs // !end
// !code: end // !end
