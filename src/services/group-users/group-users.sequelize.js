/* eslint quotes: 0 */
// Defines Sequelize model for service `groupUsers`.
const merge = require('lodash.merge');
const Sequelize = require('sequelize');
/* eslint no-unused-vars:0 */
const DataTypes = Sequelize.DataTypes;

let moduleExports = merge(
  {},

  {
    userId: {
      type: DataTypes.INTEGER,
    },
    userFirstName: {
      type: DataTypes.TEXT,
    },
    userLastName: {
      type: DataTypes.TEXT,
    },
    orgId: {
      type: DataTypes.INTEGER,
    },
    orgName: {
      type: DataTypes.TEXT,
    },
    groupId: {
      type: DataTypes.INTEGER,
    },
    groupName: {
      type: DataTypes.TEXT,
    },
  }
);

module.exports = moduleExports;
