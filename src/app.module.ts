import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LeadsModule } from './modules/leads/leads.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { DatabaseModule } from './common/database/database.module';

@Module({
  imports: [
    // Database module - JSON file persistence
    DatabaseModule,
    // Rate limiting - 60秒内最多10个请求
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    LeadsModule,
    TestimonialsModule,
    AuthModule,
    UsersModule,
    AuditLogsModule,
  ],
  providers: [
    // 全局启用rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
