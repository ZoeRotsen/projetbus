const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'auth-db733.hstgr.io',      
    user: 'u706552450_ProjetBusUser',           
    password: '@BUSmiage202526',           
    database: 'u706552450_ProjetBus',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;