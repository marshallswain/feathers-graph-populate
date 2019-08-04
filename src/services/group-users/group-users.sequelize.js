
/* eslint quotes: 0 */
// Defines Sequelize model for service `groupUsers`. (Can be re-generated.)
const merge = require('lodash.merge')
const Sequelize = require('sequelize')
// eslint-disable-next-line no-unused-vars
const DataTypes = Sequelize.DataTypes
// !code: imports // !end
// !code: init // !end

let moduleExports = merge({},
  // !<DEFAULT> code: sequelize_model
  {
    userId: {
      type: DataTypes.INTEGER
    },
    userFirstName: {
      type: DataTypes.TEXT
    },
    userLastName: {
      type: DataTypes.TEXT
    },
    orgId: {
      type: DataTypes.INTEGER
    },
    orgName: {
      type: DataTypes.TEXT
    },
    groupId: {
      type: DataTypes.INTEGER
    },
    groupName: {
      type: DataTypes.TEXT
    }
  },
  // !end
  // !code: moduleExports // !end
)

// !code: exports // !end
module.exports = moduleExports

// !code: funcs // !end
// !code: end // !end
