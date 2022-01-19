const mysql = require('mysql');

// Parámetros de conexión a la base de datos.
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database : 'esportuapp',
    multipleStatements: true
  });
  
  con.connect(function(err) {
    if (err) throw err;
  })

  module.exports = con;