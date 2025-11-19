import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PageView, PageViewDocument } from '../../schemas/page-view.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(PageView.name) private pageViewModel: Model<PageViewDocument>,
  ) {}

  async trackPageView(
    page: string,
    ipAddress: string,
    userAgent?: string,
    referer?: string,
  ): Promise<PageView> {
    const pageView = await this.pageViewModel.create({
      page,
      ipAddress,
      userAgent,
      referer,
      viewedAt: new Date(),
    });
    return pageView.toJSON();
  }

  async getDailyStats(days: number = 14) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const pageViews = await this.pageViewModel.aggregate([
      {
        $match: {
          viewedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$viewedAt',
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Fill in missing dates with 0 counts
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const found = pageViews.find(pv => pv._id === dateStr);
      result.push({
        date: dateStr,
        count: found ? found.count : 0,
      });
    }

    return result;
  }

  async getTotalViews(): Promise<number> {
    return this.pageViewModel.countDocuments();
  }

  async getTodayViews(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.pageViewModel.countDocuments({
      viewedAt: { $gte: today },
    });
  }

  async getUniqueVisitors(days: number = 7): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const result = await this.pageViewModel.aggregate([
      {
        $match: {
          viewedAt: { $gte: startDate },
          ipAddress: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$ipAddress',
        },
      },
      {
        $count: 'uniqueVisitors',
      },
    ]);

    return result.length > 0 ? result[0].uniqueVisitors : 0;
  }
}
