const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkDatabase() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting to MongoDB Atlas...');

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected successfully to MongoDB');

    const db = client.db('mypinjam');

    // Check collections
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Collections:', collections.map(c => c.name));

    // Check leads collection
    const leadsCount = await db.collection('leads').countDocuments();
    console.log(`\n👥 Total leads in database: ${leadsCount}`);

    // Get first 5 leads
    if (leadsCount > 0) {
      const sampleLeads = await db.collection('leads').find({}).limit(5).toArray();
      console.log('\n📄 Sample leads:');
      sampleLeads.forEach((lead, idx) => {
        console.log(`  ${idx + 1}. ${lead.name} - ${lead.email} - Status: ${lead.status}`);
      });
    }

    // Check users collection
    const usersCount = await db.collection('users').countDocuments();
    console.log(`\n👤 Total users: ${usersCount}`);

  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔒 Connection closed');
  }
}

checkDatabase();
