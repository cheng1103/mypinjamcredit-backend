import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum AuditAction {
  // Lead actions
  LEAD_STATUS_CHANGED = 'LEAD_STATUS_CHANGED',
  LEAD_VIEWED = 'LEAD_VIEWED',
  LEAD_UPDATED = 'LEAD_UPDATED',
  LEAD_DELETED = 'LEAD_DELETED',

  // Testimonial actions
  TESTIMONIAL_APPROVED = 'TESTIMONIAL_APPROVED',
  TESTIMONIAL_REJECTED = 'TESTIMONIAL_REJECTED',

  // User actions
  USER_CREATED = 'USER_CREATED',
  USER_DELETED = 'USER_DELETED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',

  // Auth actions
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
}

export type AuditLogDocument = AuditLog & Document;

@Schema({
  collection: 'audit_logs',
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: {
    transform: (_doc: any, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class AuditLog {
  @Prop({ required: true, enum: Object.values(AuditAction) })
  action: AuditAction;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  resourceType: string;

  @Prop()
  resourceId?: string;

  @Prop({ type: Object, default: {} })
  details: Record<string, any>;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  createdAt?: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Create indexes for better query performance
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1 });
AuditLogSchema.index({ createdAt: -1 });
