const { Pool } = require('pg');

const pool = new Pool({
    user: 'regby',
    host: 'localhost',
    database: 'apartmentDB',
    password: 'admin',
    port: 5432,
});

module.exports = pool;
