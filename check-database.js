require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkDatabase() {
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
    console.log(`\nUsing database: ${dbName}`);

    const db = client.db(dbName);

    // List all collections
    console.log('\nListing all collections in database...');
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('No collections found in database');
    } else {
      console.log(`\nFound ${collections.length} collection(s):`);
      collections.forEach((collection, index) => {
        console.log(`  ${index + 1}. ${collection.name}`);
      });

      // For each collection, count documents
      console.log('\nDocument counts:');
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`  ${collection.name}: ${count} document(s)`);

        // If it's the users collection or similar, show sample data
        if (collection.name.toLowerCase().includes('user')) {
          console.log(`\n  Sample from ${collection.name}:`);
          const samples = await db.collection(collection.name).find({}).limit(3).toArray();
          samples.forEach((doc, idx) => {
            console.log(`    Document ${idx + 1}:`, JSON.stringify(doc, null, 2));
          });
        }
      }
    }

    // Also list all databases
    console.log('\n\nListing all databases...');
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    console.log('Available databases:');
    databases.databases.forEach((db, index) => {
      console.log(`  ${index + 1}. ${db.name} (${db.sizeOnDisk} bytes)`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nConnection closed');
  }
}

checkDatabase();
