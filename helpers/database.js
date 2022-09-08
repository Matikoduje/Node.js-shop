const Sequelize = require("sequelize");
const mysqlConf = require("../configuration/database");

const sequelize = new Sequelize(
  mysqlConf.database,
  mysqlConf.user,
  mysqlConf.password,
  { dialect: "mysql", host: mysqlConf.host }
);

module.exports = sequelize;
