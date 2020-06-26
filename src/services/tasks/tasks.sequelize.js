
/* eslint quotes: 0 */
// Defines Sequelize model for service `tasks`.
const merge = require('lodash.merge')
const Sequelize = require('sequelize')
// eslint-disable-next-line no-unused-vars
const DataTypes = Sequelize.DataTypes



let moduleExports = merge({},

  {
    name: {
      type: DataTypes.TEXT
    },
    ownerIds: {
      type: DataTypes.JSONB
    },
    childTaskIds: {
      type: DataTypes.JSONB
    }
  },


)


module.exports = moduleExports



