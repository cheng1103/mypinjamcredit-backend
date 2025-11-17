import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument, AuditAction } from '../../schemas/audit-log.schema';

@Injectable()
export class AuditLogsService implements OnModuleInit {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async onModuleInit() {
    const count = await this.auditLogModel.countDocuments();
    console.log(`✅ Loaded ${count} audit logs from MongoDB`);
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
  }): Promise<AuditLogDocument> {
    const auditLog = await this.auditLogModel.create({
      action: data.action,
      userId: data.userId,
      username: data.username,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      details: data.details || {},
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

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
  }): Promise<AuditLogDocument[]> {
    const query: any = {};

    if (filters) {
      if (filters.userId) {
        query.userId = filters.userId;
      }
      if (filters.action) {
        query.action = filters.action;
      }
      if (filters.resourceType) {
        query.resourceType = filters.resourceType;
      }
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) {
          query.createdAt.$gte = filters.startDate;
        }
        if (filters.endDate) {
          query.createdAt.$lte = filters.endDate;
        }
      }
    }

    return this.auditLogModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findByResourceId(resourceId: string): Promise<AuditLogDocument[]> {
    return this.auditLogModel.find({ resourceId }).sort({ createdAt: -1 }).exec();
  }
}
