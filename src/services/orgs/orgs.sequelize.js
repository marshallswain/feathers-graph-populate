
/* eslint quotes: 0 */
// Defines Sequelize model for service `orgs`.
const merge = require('lodash.merge')
const Sequelize = require('sequelize')
// eslint-disable-next-line no-unused-vars
const DataTypes = Sequelize.DataTypes



let moduleExports = merge({},

  {
    name: {
      type: DataTypes.TEXT
    }
  },


)


module.exports = moduleExports



