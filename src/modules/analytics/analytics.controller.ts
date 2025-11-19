import { Controller, Get, Post, Body, Ip, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // Public endpoint - track page views
  @Post('track')
  async trackPageView(
    @Body('page') page: string,
    @Ip() ipAddress: string,
    @Req() req: any,
  ) {
    const userAgent = req.headers['user-agent'];
    const referer = req.headers['referer'] || req.headers['referrer'];

    await this.analyticsService.trackPageView(page, ipAddress, userAgent, referer);

    return { success: true };
  }

  // Admin only - get daily statistics
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('daily-stats')
  async getDailyStats() {
    const stats = await this.analyticsService.getDailyStats(14);
    return stats;
  }

  // Admin only - get total views
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('total-views')
  async getTotalViews() {
    const total = await this.analyticsService.getTotalViews();
    return { total };
  }

  // Admin only - get today's views
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('today-views')
  async getTodayViews() {
    const today = await this.analyticsService.getTodayViews();
    return { today };
  }

  // Admin only - get unique visitors
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('unique-visitors')
  async getUniqueVisitors() {
    const unique = await this.analyticsService.getUniqueVisitors(7);
    return { unique };
  }

  // Admin only - get overview statistics
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('overview')
  async getOverview() {
    const [total, today, unique, dailyStats] = await Promise.all([
      this.analyticsService.getTotalViews(),
      this.analyticsService.getTodayViews(),
      this.analyticsService.getUniqueVisitors(7),
      this.analyticsService.getDailyStats(14),
    ]);

    return {
      totalViews: total,
      todayViews: today,
      uniqueVisitors: unique,
      dailyStats,
    };
  }
}
