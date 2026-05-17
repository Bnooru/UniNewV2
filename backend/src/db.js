const { Pool, types } = require('pg');
types.setTypeParser(20, val => parseInt(val, 10)); // BIGINT/BIGSERIAL → número JS

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Postgres pool error:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
