const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'greatestofalltime077$',
  database: 'ticketbay',
});

module.exports = pool;
