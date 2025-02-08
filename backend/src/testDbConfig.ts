// testDbConfig.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../.env.test' });

const testDbConfig = {
  host: process.env.TEST_DB_HOST,
  port: parseInt(process.env.TEST_DB_PORT),
  user: process.env.TEST_DB_USER,
  password: process.env.TEST_DB_PASSWORD,
  database: process.env.TEST_DB_NAME,
};

export const testPool = new Pool(testDbConfig);
// Helper functions to manage the test database
export const testDb = {
  async init() {
    await testPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL
      );
    `);
    // Add additional table creation queries as needed
  },

  async cleanup() {
    await testPool.query('TRUNCATE users CASCADE');
    // Add cleanup for other tables if necessary
  },

  async seedTestData() {
    const testUser = {
      name: 'Test Admin',
      email: 'one@gmail.com',
      password: '$2b$10$YourHashedPassword',
      role: 'ADMIN',
    };
    await testPool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
      [testUser.name, testUser.email, testUser.password, testUser.role]
    );
  },
  async deleteUserByEmail(email: string) {
    await testPool.query('DELETE FROM users WHERE email = $1', [email]);
  },

  async close() {
    await testPool.end();
  },
};
