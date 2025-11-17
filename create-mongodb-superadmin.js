require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function createSuperAdmin() {
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
    const dbName = uri.split('/')[3].split('?')[0] || 'mypinjam';
    console.log(`Using database: ${dbName}`);

    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Check if superadmin already exists
    console.log('\nChecking if superadmin user already exists...');
    const existingUser = await usersCollection.findOne({ username: 'superadmin' });

    if (existingUser) {
      console.log('✅ Superadmin user already exists!');
      console.log(`  Username: ${existingUser.username}`);
      console.log(`  Email: ${existingUser.email}`);
      console.log(`  Role: ${existingUser.role}`);
      console.log(`  ID: ${existingUser.id || existingUser._id}`);

      // Update role to SUPER_ADMIN if it's not already
      if (existingUser.role !== 'SUPER_ADMIN') {
        console.log(`\nCurrent role is: ${existingUser.role}`);
        console.log('Updating role to SUPER_ADMIN...');

        await usersCollection.updateOne(
          { username: 'superadmin' },
          {
            $set: {
              role: 'SUPER_ADMIN',
              updatedAt: new Date()
            }
          }
        );

        console.log('✅ Successfully updated role to SUPER_ADMIN!');
      } else {
        console.log('Role is already SUPER_ADMIN, no update needed.');
      }
    } else {
      // Create new superadmin user
      console.log('No superadmin user found. Creating new SUPERADMIN user...');

      // Get password from environment or use default
      const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123456';

      // Hash password with bcrypt (same as NestJS backend)
      console.log('Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user object
      const newUser = {
        id: uuidv4(),
        username: 'superadmin',
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

      console.log('\n⚠️  IMPORTANT: Save this password securely!');
      console.log(`Default password: ${password}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nConnection closed');
  }
}

createSuperAdmin();
