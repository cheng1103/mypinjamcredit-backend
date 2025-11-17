require('dotenv').config();
const { MongoClient } = require('mongodb');

async function listUsers() {
  // Get MongoDB URI from environment variable
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('Error: MONGODB_URI not found in .env file');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');

    // Get database name from URI or use default
    const dbName = uri.split('/')[3].split('?')[0] || 'admin-system';
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // List all users
    console.log('\nListing all users in database...');
    const users = await usersCollection.find({}).toArray();

    if (users.length === 0) {
      console.log('No users found in database');
    } else {
      console.log(`\nFound ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log(`  ID: ${user._id}`);
        console.log(`  Username: ${user.username}`);
        console.log(`  Email: ${user.email || 'N/A'}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Created: ${user.createdAt || 'N/A'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

listUsers();
