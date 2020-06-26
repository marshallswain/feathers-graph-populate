/* eslint quotes: 0 */
// Defines Sequelize model for service `orgs`.
const merge = require('lodash.merge');
const Sequelize = require('sequelize');
/* eslint no-unused-vars:0 */
const DataTypes = Sequelize.DataTypes;

let moduleExports = merge(
  {},

  {
    name: {
      type: DataTypes.TEXT,
    },
  }
);

module.exports = moduleExports;
