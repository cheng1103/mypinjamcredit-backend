import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialStatusDto } from './dto/update-testimonial-status.dto';
import { TestimonialsService } from './testimonials.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { UserRole } from '../../common/enums';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction } from '../audit-logs/audit-log.entity';

@Controller('testimonials')
export class TestimonialsController {
  constructor(
    private readonly testimonialsService: TestimonialsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  // Public endpoint - view approved testimonials
  @Get()
  findApproved() {
    return this.testimonialsService.findApproved();
  }

  // Admin only - view all testimonials for moderation
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('moderation')
  findAll() {
    return this.testimonialsService.findAll();
  }

  // Public endpoint - submit testimonial
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async create(@Body() dto: CreateTestimonialDto) {
    const testimonial = await this.testimonialsService.create(dto);
    return {
      id: testimonial.id,
      status: testimonial.status
    };
  }

  // Admin only - approve/reject testimonial
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTestimonialStatusDto,
    @CurrentUser() user: any,
    @Ip() ipAddress: string,
    @Req() req: any,
  ) {
    const testimonial = await this.testimonialsService.findOne(id);
    if (!testimonial) {
      throw new Error('Testimonial not found');
    }
    const updatedTestimonial = this.testimonialsService.updateStatus(id, dto);

    // Log the action
    const action = dto.status === 'APPROVED'
      ? AuditAction.TESTIMONIAL_APPROVED
      : AuditAction.TESTIMONIAL_REJECTED;

    await this.auditLogsService.create({
      action,
      userId: user.sub,
      username: user.username,
      resourceType: 'testimonial',
      resourceId: id,
      details: {
        status: dto.status,
        testimonialName: testimonial.name,
      },
      ipAddress,
      userAgent: req.headers['user-agent'],
    });

    return updatedTestimonial;
  }
}
