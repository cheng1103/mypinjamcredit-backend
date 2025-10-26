# 数据库设置指南

## ✅ 已完成

我已经为你实施了**JSON文件数据库系统**，这样：
- ✅ 数据持久化到 `backend/data/` 文件夹
- ✅ 服务器重启后数据不会丢失
- ✅ 简单、可靠、零配置
- ✅ Leads模块已完全迁移

## 📁 数据存储位置

```
backend/
├── data/
│   ├── leads.json          # 客户leads数据
│   ├── users.json          # 用户账户
│   ├── testimonials.json   # 客户反馈
│   └── audit-logs.json     # 审计日志
```

## 🔧 已更新的模块

### ✅ Leads Service (完成)
- 所有CRUD操作现在自动保存
- 数据在服务启动时自动加载

### ⚠️ 待更新的模块

以下模块需要类似更新（我已经为Leads做了示例）：

1. **UsersService** (`src/modules/users/users.service.ts`)
2. **TestimonialsService** (`src/modules/testimonials/testimonials.service.ts`)
3. **AuditLogsService** (`src/modules/audit-logs/audit-logs.service.ts`)

## 📝 迁移步骤（其他模块）

对于每个service，需要：

### 1. 添加依赖注入
```typescript
constructor(private readonly db: JsonDbService) {}
```

### 2. 实现 OnModuleInit
```typescript
import { OnModuleInit } from '@nestjs/common';

export class YourService implements OnModuleInit {
  private collectionName = 'your-collection';

  async onModuleInit() {
    this.yourData = await this.db.findAll<YourType>(this.collectionName);
    console.log(`✅ Loaded ${this.yourData.length} items from database`);
  }

  private async save() {
    await this.db.write(this.collectionName, this.yourData);
  }
}
```

### 3. 在每个修改操作后调用save()
```typescript
async create(...) {
  // ... create logic
  await this.save();
  return item;
}

async update(...) {
  // ... update logic
  await this.save();
  return item;
}
```

## 🚀 升级到MongoDB（未来）

当需要时，可以轻松升级到MongoDB：

### 步骤 1: 注册MongoDB Atlas（免费）
```
1. 访问 https://www.mongodb.com/cloud/atlas
2. 注册免费账号
3. 创建免费cluster（512MB）
4. 获取连接字符串
```

### 步骤 2: 安装Mongoose（已完成）
```bash
npm install @nestjs/mongoose mongoose
```

### 步骤 3: 更新环境变量
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mypinjam?retryWrites=true&w=majority
```

### 步骤 4: 创建Schemas
```typescript
// lead.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Lead extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  email?: string;

  @Prop({ required: true })
  loanAmount: number;

  @Prop({ required: true })
  loanType: string;

  @Prop({ default: 'SUBMITTED' })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
```

### 步骤 5: 更新AppModule
```typescript
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
    // ... other modules
  ],
})
```

### 步骤 6: 数据迁移脚本
```typescript
// migrate-to-mongodb.ts
import { readFile } from 'fs/promises';
import mongoose from 'mongoose';

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Read JSON files
  const leads = JSON.parse(await readFile('data/leads.json', 'utf-8'));

  // Insert into MongoDB
  await Lead.insertMany(leads);

  console.log(`Migrated ${leads.length} leads`);
}

migrate();
```

## 💡 当前方案优势

### JSON文件数据库
✅ 零配置
✅ 免费
✅ 简单维护
✅ 易于备份（直接复制data文件夹）
✅ 易于查看（可用文本编辑器打开）
✅ 适合小到中型应用（<10,000条记录）

### 何时升级到MongoDB？
- 数据量超过5,000条记录
- 需要复杂查询
- 需要全文搜索
- 多服务器部署
- 需要事务支持

## 🔒 数据安全

### 备份策略
```bash
# 每日备份脚本
#!/bin/bash
DATE=$(date +%Y-%m-%d)
tar -czf backups/data-$DATE.tar.gz data/

# 保留最近30天的备份
find backups/ -name "data-*.tar.gz" -mtime +30 -delete
```

### .gitignore
确保 `data/` 文件夹不被提交到git：
```gitignore
# Database files
data/
*.json

# Backups
backups/
```

## 📊 性能对比

| 特性 | JSON文件 | MongoDB |
|------|----------|---------|
| 设置时间 | 0分钟 | 30分钟 |
| 成本 | RM 0 | RM 0 (免费tier) |
| 读取速度 | 快（<1000条） | 快 |
| 写入速度 | 中等 | 快 |
| 查询能力 | 基础 | 高级 |
| 扩展性 | 低 | 高 |
| 维护难度 | 低 | 中 |

## 🎯 推荐使用场景

### 使用JSON文件数据库
- ✅ 开发测试阶段
- ✅ 小型项目（<100 leads/天）
- ✅ 单服务器部署
- ✅ 预算有限

### 升级到MongoDB
- ⏰ 大量数据（>5000条）
- ⏰ 高并发访问
- ⏰ 需要复杂查询
- ⏰ 多服务器部署

## 🆘 故障排查

### 数据丢失了？
1. 检查 `backend/data/` 文件夹是否存在
2. 检查文件权限
3. 查看服务器日志

### 保存失败？
1. 检查磁盘空间
2. 检查文件夹权限
3. 查看错误日志

### 数据损坏？
1. 恢复备份
2. 手动修复JSON文件
3. 联系开发者

## ✅ 验证数据持久化

测试步骤：
1. 提交一个测试lead
2. 检查 `backend/data/leads.json` 文件
3. 重启服务器
4. 访问管理后台，数据应该还在

## 📞 需要帮助？

如果需要：
- 完成其他模块的迁移
- 升级到MongoDB
- 数据迁移脚本
- 自动备份设置

随时联系！
