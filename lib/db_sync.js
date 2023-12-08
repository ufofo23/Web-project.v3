var mysql_sync = require('sync-mysql');
var db_sync = new mysql_sync({
    host:'localhost',
    user:'root',
    database:'project_nodejs'
  });
module.exports = db_sync;