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

export interface AuditLog {
  id: string;
  action: AuditAction;
  userId: string;
  username: string;
  resourceType: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
