const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'newsocialnetwork',
  password: 'password',
  port: 5432,
});

async function main() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
    
    const res = await client.query('SELECT version()');
    console.log('PostgreSQL version:', res.rows[0].version);
    
    await client.end();
    console.log('Disconnected from PostgreSQL');
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err);
  }
}

main(); 