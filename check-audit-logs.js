const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkAuditLogs() {
  const uri = process.env.MONGODB_URI;
  console.log('🔍 检查audit logs...\n');

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ 连接成功\n');

    const db = client.db('mypinjam');

    // 检查audit_logs是否有关于leads的记录
    const auditLogs = await db.collection('audit_logs').find({}).sort({ createdAt: -1 }).toArray();

    console.log(`📊 找到 ${auditLogs.length} 条audit logs\n`);

    if (auditLogs.length > 0) {
      console.log('详细记录:');
      auditLogs.forEach((log, idx) => {
        console.log(`\n${idx + 1}. ${log.action} - ${log.createdAt}`);
        console.log(`   User: ${log.userId}`);
        console.log(`   Details: ${JSON.stringify(log.details || log.data, null, 2)}`);
      });
    } else {
      console.log('❌ 没有找到任何audit logs记录\n');
    }

    // 同时检查是否有任何collection有11月的数据
    console.log('\n\n🔍 检查所有collections是否有11月数据...\n');
    const collections = await db.listCollections().toArray();

    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments({
        createdAt: {
          $gte: new Date('2025-11-01'),
          $lt: new Date('2025-12-01')
        }
      });

      if (count > 0) {
        console.log(`✅ ${col.name}: 找到 ${count} 条11月数据`);
        const samples = await db.collection(col.name).find({
          createdAt: {
            $gte: new Date('2025-11-01'),
            $lt: new Date('2025-12-01')
          }
        }).limit(5).toArray();
        samples.forEach(s => {
          console.log(`   - ${JSON.stringify(s)}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await client.close();
    console.log('\n🔒 连接已关闭');
  }
}

checkAuditLogs();
