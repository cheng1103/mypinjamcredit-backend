const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migrateData() {
  const uri = process.env.MONGODB_URI;
  console.log('🚀 开始从JSON文件迁移数据到MongoDB...\n');

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ 成功连接到MongoDB Atlas\n');

    const db = client.db('mypinjam');

    // 读取leads.json
    const leadsPath = path.join(__dirname, 'data', 'leads.json');
    const leadsData = JSON.parse(fs.readFileSync(leadsPath, 'utf8'));

    console.log(`📄 找到 ${leadsData.length} 条leads数据\n`);

    // 转换并导入leads
    let imported = 0;
    for (const lead of leadsData) {
      // 转换字段名: fullName -> name
      const mongoLead = {
        name: lead.fullName || lead.name,
        email: lead.email,
        phone: lead.phone,
        occupation: lead.occupation,
        monthlyIncome: lead.monthlyIncome ? String(lead.monthlyIncome) : undefined,
        loanAmount: Number(lead.loanAmount),
        loanType: lead.loanType,
        location: lead.location,
        status: lead.status || 'SUBMITTED',
        assignedTo: lead.assignedTo || null,
        createdAt: lead.createdAt ? new Date(lead.createdAt) : new Date(),
        updatedAt: lead.updatedAt ? new Date(lead.updatedAt) : new Date(),
      };

      // 删除undefined字段
      Object.keys(mongoLead).forEach(key =>
        mongoLead[key] === undefined && delete mongoLead[key]
      );

      // 检查是否已存在
      const existing = await db.collection('leads').findOne({
        email: mongoLead.email,
        phone: mongoLead.phone
      });

      if (existing) {
        console.log(`⏭️  跳过已存在的lead: ${mongoLead.name} (${mongoLead.email})`);
      } else {
        await db.collection('leads').insertOne(mongoLead);
        imported++;
        console.log(`✅ 导入成功: ${mongoLead.name} (${mongoLead.email})`);
      }
    }

    console.log(`\n🎉 迁移完成！`);
    console.log(`📊 总共导入 ${imported} 条新leads`);
    console.log(`📊 跳过 ${leadsData.length - imported} 条已存在的leads\n`);

    // 验证导入
    const totalLeads = await db.collection('leads').countDocuments();
    console.log(`✨ MongoDB中现有leads总数: ${totalLeads}\n`);

    // 显示所有leads
    const allLeads = await db.collection('leads').find({}).toArray();
    console.log('📋 所有leads数据:');
    allLeads.forEach((lead, i) => {
      console.log(`${i + 1}. ${lead.name} - ${lead.email} - ${lead.phone} - RM${lead.loanAmount}`);
    });

  } catch (error) {
    console.error('❌ 迁移错误:', error);
  } finally {
    await client.close();
    console.log('\n🔒 连接已关闭');
  }
}

migrateData();
