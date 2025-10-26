import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { AuditAction } from './audit-log.entity';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  async findAll(
    @Query('userId') userId?: string,
    @Query('action') action?: AuditAction,
    @Query('resourceType') resourceType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};

    if (userId) filters.userId = userId;
    if (action) filters.action = action;
    if (resourceType) filters.resourceType = resourceType;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return this.auditLogsService.findAll(filters);
  }

  @Get('resource')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findByResourceId(@Query('resourceId') resourceId: string) {
    return this.auditLogsService.findByResourceId(resourceId);
  }
}
