var internetAvailable = require("internet-available");
const sqlite3 = require('sqlite3');
var db = new sqlite3.Database('./db/internet.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to database.');
  });
var cron = require('node-cron');

main();


function main(){
    checkIfTableExists();
    cron.schedule('*/5 * * * *', () => {
        checkAndInsert();
      });
}



function checkAndInsert(){
    internetAvailable().then(function(){
        insert('SI');
    }).catch(function(){
        insert('NO');
    });
}

//SQLite

function checkIfTableExists(){
    const createTableSql = ` 
    CREATE TABLE IF NOT EXISTS internet ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        dia INTEGER NOT NULL, 
        mes INTEGER NOT NULL, 
        ano INTEGER NOT NULL,
        hora INTEGER NOT NULL,
        minuto INTEGER NOT NULL,
        internet TEXT NOT NULL
    )`; 
    db.run(createTableSql, (err) => { 
        if (err) { 
            return console.error('Error al crear la tabla:', err.message); 
        } 
        console.log('Tabla creada correctamente'); 
    });
}

function insert(internet){
    const today = new Date();
    const dayOfMonth = today.getDate();
    const month = today.getMonth()+1;
    const year = today.getFullYear();
    const hour = today.getHours();
    const min = today.getMinutes();
    db.run(`INSERT INTO internet(dia, mes, ano, hora, minuto, internet) VALUES(?,?,?,?,?,?)`, [dayOfMonth, month, year, hour, min, internet], function(err) {
        if (err) {
          return console.log(err.message);
        }
        // get the last insert id
        console.log(`Se ha insertado un registro de internet: ${dayOfMonth}-${month}-${year} ${hour}:${min} -> ${internet}`);
      });
}

async function getInternetDate(dia, mes, ano) {
    let sql = `SELECT hora, minuto, internet from internet where dia = ? and mes = ? and ano = ?`;
    try {
        let rows = await new Promise((resolve, reject) => {
            db.all(sql, [dia, mes, ano], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
        return rows;
    } catch (err) {
        console.error(err.message);
    }
}


//Express
const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(__dirname + '/html'));
app.get('/*', (req, res) => res.sendFile(path.join(__dirname)));

app.get("/internet", function (req, res) {
    const dia = req.query.dia;
    const mes = req.query.mes;
    const ano = req.query.ano;
    getInternetDate(dia, mes, ano).then(rows=>{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader("Access-Control-Allow-Headers", "*");
        res.send(rows);
    });
  });

  app.listen(3000, function () {
    console.log("Aplicación ejemplo, escuchando el puerto 3000!");
  });



