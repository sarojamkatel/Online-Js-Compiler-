import { testDb } from './testDbConfig';

// Before all tests, initialize the test database
before(async () => {
  console.log('Initializing test database...');
  await testDb.init();
  await testDb.seedTestData();
});

// After each test, clean up the database
afterEach(async () => {
  console.log('Cleaning up database after test...');
  await testDb.cleanup();
});

// After all tests, close the database connection
after(async () => {
  console.log('Closing test database connection...');
  await testDb.close();
});

