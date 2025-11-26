import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Param, Patch, Post, Delete, UseGuards, Req } from '@nestjs/common';
import { ApplicationStatus, UserRole } from '../../common/enums';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction } from '../audit-logs/audit-log.entity';

@Controller('leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  // Public endpoint - no authentication required
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async create(@Body() dto: CreateLeadDto, @Ip() ipAddress: string) {
    const lead = await this.leadsService.create(dto, ipAddress);
    return {
      referenceId: lead.id,
      status: lead.status
    };
  }

  // Admin only - view all leads
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get()
  findAll() {
    return this.leadsService.findAll();
  }

  // Admin only - view single lead
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  // Admin only - update lead status
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ApplicationStatus,
    @CurrentUser() user: any,
    @Ip() ipAddress: string,
    @Req() req: any,
  ) {
    const lead = await this.leadsService.findOne(id);
    if (!lead) {
      throw new Error('Lead not found');
    }
    const oldStatus = lead.status;
    const updatedLead = this.leadsService.updateStatus(id, status);

    // Log the action
    await this.auditLogsService.create({
      action: AuditAction.LEAD_STATUS_CHANGED,
      userId: user.userId,
      username: user.username,
      resourceType: 'lead',
      resourceId: id,
      details: {
        oldStatus,
        newStatus: status,
        leadName: lead.fullName,
      },
      ipAddress,
      userAgent: req.headers['user-agent'],
    });

    return updatedLead;
  }

  // Admin only - assign lead to admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch(':id/assign')
  assignLead(@Param('id') id: string, @Body('adminId') adminId: string) {
    return this.leadsService.assignLead(id, adminId);
  }

  // Admin only - unassign lead
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch(':id/unassign')
  unassignLead(@Param('id') id: string) {
    return this.leadsService.unassignLead(id);
  }

  // Admin only - update lead data
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch(':id')
  async updateLead(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateLeadDto>,
    @CurrentUser() user: any,
    @Ip() ipAddress: string,
    @Req() req: any,
  ) {
    const updatedLead = await this.leadsService.updateLead(id, updateData);

    // Log the action
    await this.auditLogsService.create({
      action: AuditAction.LEAD_UPDATED,
      userId: user.userId,
      username: user.username,
      resourceType: 'lead',
      resourceId: id,
      details: {
        leadName: updatedLead.fullName,
        updatedFields: Object.keys(updateData),
      },
      ipAddress,
      userAgent: req.headers['user-agent'],
    });

    return updatedLead;
  }

  // Admin only - delete lead
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete(':id')
  async deleteLead(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Ip() ipAddress: string,
    @Req() req: any,
  ) {
    const lead = await this.leadsService.findOne(id);
    if (!lead) {
      throw new Error('Lead not found');
    }

    await this.leadsService.deleteLead(id);

    // Log the action
    await this.auditLogsService.create({
      action: AuditAction.LEAD_DELETED,
      userId: user.userId,
      username: user.username,
      resourceType: 'lead',
      resourceId: id,
      details: {
        leadName: lead.fullName,
        leadPhone: lead.phone,
      },
      ipAddress,
      userAgent: req.headers['user-agent'],
    });

    return { message: 'Lead deleted successfully' };
  }
}



