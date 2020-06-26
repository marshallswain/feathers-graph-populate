/* eslint quotes: 0 */
// Defines Sequelize model for service `posts`.
const merge = require('lodash.merge');
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

let moduleExports = merge(
  {},
  {
    title: {
      type: DataTypes.TEXT,
    },
    authorId: {
      type: DataTypes.INTEGER,
    },
  }
);

module.exports = moduleExports;
