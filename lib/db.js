var mysql = require('mysql');
var db = mysql.createConnection({
    host:'localhost',
    user:'root',
    database:'project_nodejs'
  });
db.connect();
module.exports = db;