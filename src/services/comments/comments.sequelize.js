/* eslint quotes: 0 */
// Defines Sequelize model for service `comments`.
const merge = require('lodash.merge');
const Sequelize = require('sequelize');
/* eslint no-unused-vars:0 */
const DataTypes = Sequelize.DataTypes;

let moduleExports = merge(
  {},
  {
    text: {
      type: DataTypes.TEXT,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
    userFirstName: {
      type: DataTypes.TEXT,
    },
    userLastName: {
      type: DataTypes.TEXT,
    },
    postId: {
      type: DataTypes.INTEGER,
    },
  }
);

module.exports = moduleExports;
