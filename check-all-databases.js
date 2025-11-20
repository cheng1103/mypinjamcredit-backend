const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkAllDatabases() {
  const uri = process.env.MONGODB_URI;
  console.log('🔍 检查所有数据库...\n');
  console.log('MongoDB URI:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'), '\n');

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ 成功连接到MongoDB Atlas\n');

    // 列出所有数据库
    const adminDb = client.db().admin();
    const { databases } = await adminDb.listDatabases();

    console.log('📁 发现的所有数据库:');
    console.log('='.repeat(60));
    databases.forEach((db, idx) => {
      console.log(`${idx + 1}. ${db.name} (大小: ${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    console.log('='.repeat(60));
    console.log();

    // 检查每个数据库
    for (const dbInfo of databases) {
      if (dbInfo.name === 'admin' || dbInfo.name === 'local' || dbInfo.name === 'config') {
        continue; // 跳过系统数据库
      }

      console.log(`\n🔎 检查数据库: ${dbInfo.name}`);
      console.log('-'.repeat(60));

      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();

      console.log(`  Collections: ${collections.map(c => c.name).join(', ')}`);

      // 检查leads collection
      if (collections.find(c => c.name === 'leads')) {
        const leadsCount = await db.collection('leads').countDocuments();
        console.log(`  ✨ LEADS数量: ${leadsCount}`);

        if (leadsCount > 0) {
          console.log(`  \n  📋 前5条leads数据:`);
          const sampleLeads = await db.collection('leads').find({}).limit(5).toArray();
          sampleLeads.forEach((lead, i) => {
            console.log(`    ${i + 1}. ${lead.name || 'N/A'} - ${lead.email || 'N/A'} - ${lead.phone || 'N/A'}`);
            console.log(`       创建时间: ${lead.createdAt || 'N/A'}`);
          });
        }
      }

      // 检查其他可能包含leads的collection
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        if (count > 0) {
          console.log(`  📊 ${col.name}: ${count} 条记录`);
        }
      }
    }

    // 专门检查mypinjam数据库
    console.log('\n\n🎯 重点检查 mypinjam 数据库:');
    console.log('='.repeat(60));
    const mypinjamDb = client.db('mypinjam');
    const collections = await mypinjamDb.listCollections().toArray();

    for (const col of collections) {
      const count = await mypinjamDb.collection(col.name).countDocuments();
      console.log(`${col.name}: ${count} 条记录`);

      if (col.name === 'leads' && count > 0) {
        const allLeads = await mypinjamDb.collection('leads').find({}).toArray();
        console.log('\n所有leads数据:');
        allLeads.forEach((lead, i) => {
          console.log(`${i + 1}. ${JSON.stringify(lead, null, 2)}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
  } finally {
    await client.close();
    console.log('\n\n🔒 连接已关闭');
  }
}

checkAllDatabases();
