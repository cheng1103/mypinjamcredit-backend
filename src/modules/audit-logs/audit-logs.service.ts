import { Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AuditLog, AuditAction } from './audit-log.entity';
import { JsonDbService } from '../../common/database/json-db.service';

@Injectable()
export class AuditLogsService implements OnModuleInit {
  private readonly collectionName = 'audit-logs';
  private auditLogs: AuditLog[] = [];

  constructor(private readonly db: JsonDbService) {}

  async onModuleInit() {
    this.auditLogs = await this.db.findAll<AuditLog>(this.collectionName);
    console.log(`✅ Loaded ${this.auditLogs.length} audit logs from database`);
  }

  private async saveAuditLogs() {
    await this.db.write(this.collectionName, this.auditLogs);
  }

  async create(data: {
    action: AuditAction;
    userId: string;
    username: string;
    resourceType: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    const auditLog: AuditLog = {
      id: randomUUID(),
      action: data.action,
      userId: data.userId,
      username: data.username,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      details: data.details || {},
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      createdAt: new Date(),
    };

    this.auditLogs.push(auditLog);

    // Save to database
    await this.saveAuditLogs();

    // Log to console for debugging
    console.log(`[AUDIT] ${data.username} - ${data.action} - ${data.resourceType}${data.resourceId ? ` (${data.resourceId})` : ''}`);

    return auditLog;
  }

  async findAll(filters?: {
    userId?: string;
    action?: AuditAction;
    resourceType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditLog[]> {
    let logs = [...this.auditLogs];

    if (filters) {
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.action) {
        logs = logs.filter(log => log.action === filters.action);
      }
      if (filters.resourceType) {
        logs = logs.filter(log => log.resourceType === filters.resourceType);
      }
      if (filters.startDate) {
        logs = logs.filter(log => log.createdAt >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.createdAt <= filters.endDate!);
      }
    }

    return logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findByResourceId(resourceId: string): Promise<AuditLog[]> {
    return this.auditLogs
      .filter(log => log.resourceId === resourceId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
