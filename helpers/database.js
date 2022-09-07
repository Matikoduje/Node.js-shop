const mysql = require("mysql2");
const mysqlConfiguration = require('../configuration/database');

const pool = mysql.createPool({
  host: mysqlConfiguration.host,
  user: mysqlConfiguration.user,
  database: mysqlConfiguration.database,
  password: mysqlConfiguration.password,
});

module.exports = pool.promise();
