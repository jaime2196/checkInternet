var internetAvailable = require("internet-available");
const sqlite3 = require('sqlite3');

//Network speed
const NetworkSpeed = require('network-speed');  
const testNetworkSpeed = new NetworkSpeed();

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
    //Cada 5 minutos
    cron.schedule('*/5 * * * *', () => {
        checkAndInsert();
      });
    //Cada hora
    cron.schedule('0 * * * *', () => {
        checkSpeedAndInsert();
    });
}

async function checkSpeedAndInsert() {
    let download = await getNetworkDownloadSpeed();
    let upload = await getNetworkUploadSpeed();
    console.log(download);
    console.log(upload);
    insertVelocidad(upload.mbps, download.mbps);
}



function checkAndInsert(){
    internetAvailable().then(function(){
        insertInternet('SI');
    }).catch(function(){
        insertInternet('NO');
    });
}

//SQLite

function checkIfTableExists(){
    let createTableSql = ` 
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
        console.log('Tabla internet creada correctamente'); 
    });

    createTableSql = ` 
    CREATE TABLE IF NOT EXISTS velocidad ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        dia INTEGER NOT NULL, 
        mes INTEGER NOT NULL, 
        ano INTEGER NOT NULL,
        hora INTEGER NOT NULL,
        minuto INTEGER NOT NULL,
        subida TEXT NOT NULL,
        bajada TEXT NOT NULL
    )`; 
    db.run(createTableSql, (err) => { 
        if (err) { 
            return console.error('Error al crear la tabla:', err.message); 
        } 
        console.log('Tabla velocidad creada correctamente'); 
    });
}

function insertInternet(internet){
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

function insertVelocidad(subida, bajada){
    const today = new Date();
    const dayOfMonth = today.getDate();
    const month = today.getMonth()+1;
    const year = today.getFullYear();
    const hour = today.getHours();
    const min = today.getMinutes();
    db.run(`INSERT INTO velocidad(dia, mes, ano, hora, minuto, subida, bajada) VALUES(?,?,?,?,?,?,?)`, [dayOfMonth, month, year, hour, min, subida, bajada], function(err) {
        if (err) {
          return console.log(err.message);
        }
        // get the last insert id
        console.log(`Se ha insertado un registro de velocidad: ${dayOfMonth}-${month}-${year} ${hour}:${min} -> ${subida} y ${bajada}`);
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

async function getVelocidadDate(dia, mes, ano) {
    let sql = `SELECT hora, minuto, subida, bajada from velocidad where dia = ? and mes = ? and ano = ?`;
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

async function getNetworkDownloadSpeed() {
    const baseUrl = 'https://eu.httpbin.org/stream-bytes/5000000';
    const fileSizeInBytes = 5000000;
    const speed = await testNetworkSpeed.checkDownloadSpeed(baseUrl, fileSizeInBytes);
    return speed;
}

async function getNetworkUploadSpeed() {
    const options = {
      hostname: 'www.google.com',
      port: 80,
      path: '/catchers/544b09b4599c1d0200000289',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const fileSizeInBytes = 20000000
    const speed = await testNetworkSpeed.checkUploadSpeed(options, fileSizeInBytes);
    return speed;
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

  app.get("/velocidad", function (req, res) {
    const dia = req.query.dia;
    const mes = req.query.mes;
    const ano = req.query.ano;
    getVelocidadDate(dia, mes, ano).then(rows=>{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader("Access-Control-Allow-Headers", "*");
        res.send(rows);
    });
  });

  app.listen(3000, function () {
    console.log("Aplicación ejemplo, escuchando el puerto 3000!");
  });



