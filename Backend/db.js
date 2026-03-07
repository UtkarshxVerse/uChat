const mysql = require("mysql2");
const config = require("./config/config.js");

const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  port: config.db.port,
  database: "crud",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = pool.promise(); // enables async/await queries

console.log("MySQL pool created");

module.exports = db;
