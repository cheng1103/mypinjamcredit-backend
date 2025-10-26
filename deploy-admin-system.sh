#!/bin/bash

# 这个脚本将创建所有admin系统和安全相关的文件
# 使用方法: chmod +x deploy-admin-system.sh && ./deploy-admin-system.sh

echo "🚀 开始部署Admin系统和安全功能..."

# 创建目录结构
echo "📁 创建目录结构..."
mkdir -p src/modules/users/dto
mkdir -p src/modules/auth/dto
mkdir -p src/modules/auth/guards
mkdir -p src/modules/auth/strategies
mkdir -p src/common/guards
mkdir -p src/common/decorators

echo "✅ 目录结构创建完成"
echo "📝 请按照 IMPLEMENTATION_GUIDE.md 中的代码创建以下文件："
echo ""
echo "优先级1 - Users Module:"
echo "  - src/modules/users/users.service.ts"
echo "  - src/modules/users/users.controller.ts"
echo "  - src/modules/users/users.module.ts"
echo "  - src/modules/users/dto/create-user.dto.ts"
echo ""
echo "优先级2 - Auth Module:"
echo "  - src/modules/auth/auth.service.ts"
echo "  - src/modules/auth/auth.controller.ts"
echo "  - src/modules/auth/auth.module.ts"
echo "  - src/modules/auth/dto/login.dto.ts"
echo "  - src/modules/auth/dto/change-password.dto.ts"
echo "  - src/modules/auth/strategies/jwt.strategy.ts"
echo "  - src/modules/auth/strategies/local.strategy.ts"
echo "  - src/modules/auth/guards/jwt-auth.guard.ts"
echo "  - src/modules/auth/guards/local-auth.guard.ts"
echo "  - src/modules/auth/guards/roles.guard.ts"
echo ""
echo "优先级3 - 安全功能:"
echo "  - 更新 src/app.module.ts 添加 ThrottlerModule, AuthModule, UsersModule"
echo "  - 更新 src/main.ts 添加 helmet, rate limiting"
echo "  - src/common/guards/ip-whitelist.guard.ts"
echo "  - src/common/decorators/roles.decorator.ts"
echo ""
echo "✨ 所有文件的完整代码都在 IMPLEMENTATION_GUIDE.md 中"
echo "💡 建议使用 Claude Code 或 VS Code 逐个复制粘贴创建文件"
