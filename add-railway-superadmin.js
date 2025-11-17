require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function addRailwaySuperAdmin() {
  // Use Railway's MongoDB URI
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

    // Get database name from URI
    const dbName = uri.split('/')[3].split('?')[0] || 'mypinjam';
    console.log(`Using database: ${dbName}`);

    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Use Railway's DEFAULT_ADMIN_PASSWORD
    const password = 'MyPinjam';

    console.log('\nCreating new SUPERADMIN user with Railway password...');

    // Hash password with bcrypt (same as NestJS backend)
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object with different username to avoid conflict
    const newUser = {
      id: uuidv4(),
      username: 'admin',
      email: 'admin@mypinjamcredit.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert user into database
    console.log('Inserting user into database...');
    await usersCollection.insertOne(newUser);

    console.log('\n✅ Successfully created SUPERADMIN user!');
    console.log('\nUser Details:');
    console.log(`  ID: ${newUser.id}`);
    console.log(`  Username: ${newUser.username}`);
    console.log(`  Email: ${newUser.email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Role: ${newUser.role}`);
    console.log(`  Active: ${newUser.isActive}`);
    console.log(`  Created: ${newUser.createdAt}`);

    console.log('\n⚠️  IMPORTANT: Save these credentials securely!');
    console.log(`Username: ${newUser.username}`);
    console.log(`Password: ${password}`);
    console.log('\nYou can now login to the admin dashboard with these credentials.');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nConnection closed');
  }
}

addRailwaySuperAdmin();
