require('dotenv').config();
const { MongoClient } = require('mongodb');

async function updateUserRole() {
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

    // Find the user with username "superadmin"
    console.log('\nSearching for user with username "superadmin"...');
    const user = await usersCollection.findOne({ username: 'superadmin' });

    if (!user) {
      console.error('Error: User with username "superadmin" not found');
      await client.close();
      process.exit(1);
    }

    console.log('Found user:');
    console.log(`  Username: ${user.username}`);
    console.log(`  Email: ${user.email || 'N/A'}`);
    console.log(`  Current Role: ${user.role}`);
    console.log(`  ID: ${user._id}`);

    // Update the user's role to SUPERADMIN
    console.log('\nUpdating role to SUPERADMIN...');
    const result = await usersCollection.updateOne(
      { username: 'superadmin' },
      { $set: { role: 'SUPERADMIN' } }
    );

    if (result.modifiedCount === 1) {
      console.log('✅ Successfully updated user role to SUPERADMIN!');

      // Verify the update
      const updatedUser = await usersCollection.findOne({ username: 'superadmin' });
      console.log('\nVerified updated user:');
      console.log(`  Username: ${updatedUser.username}`);
      console.log(`  New Role: ${updatedUser.role}`);
    } else {
      console.log('⚠️  No changes made - role might already be SUPERADMIN');
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nConnection closed');
  }
}

updateUserRole();
