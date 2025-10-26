import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { TestimonialStatus } from '../../common/enums';
import { JsonDbService } from '../../common/database/json-db.service';
import type { CreateTestimonialDto } from './dto/create-testimonial.dto';
import type { UpdateTestimonialStatusDto } from './dto/update-testimonial-status.dto';

export interface TestimonialRecord extends CreateTestimonialDto {
  id: string;
  status: TestimonialStatus;
  createdAt: Date;
  updatedAt: Date;
  moderatorLog: Array<{
    moderatorId: string;
    status: TestimonialStatus;
    reason?: string;
    timestamp: Date;
  }>;
}

@Injectable()
export class TestimonialsService implements OnModuleInit {
  private readonly collectionName = 'testimonials';
  private testimonials: TestimonialRecord[] = [];

  constructor(private readonly db: JsonDbService) {}

  async onModuleInit() {
    this.testimonials = await this.db.findAll<TestimonialRecord>(this.collectionName);
    console.log(`✅ Loaded ${this.testimonials.length} testimonials from database`);
  }

  private async saveTestimonials() {
    await this.db.write(this.collectionName, this.testimonials);
  }

  async create(payload: CreateTestimonialDto): Promise<TestimonialRecord> {
    const now = new Date();
    const record: TestimonialRecord = {
      ...payload,
      id: randomUUID(),
      status: TestimonialStatus.PENDING,
      createdAt: now,
      updatedAt: now,
      moderatorLog: [
        {
          moderatorId: 'system',
          status: TestimonialStatus.PENDING,
          timestamp: now
        }
      ]
    };

    this.testimonials.push(record);
    await this.saveTestimonials();
    return record;
  }

  findApproved() {
    return this.testimonials
      .filter((item) => item.status === TestimonialStatus.APPROVED)
      .map(({ moderatorLog, ...rest }) => rest);
  }

  findAll() {
    return [...this.testimonials];
  }

  findOne(id: string): TestimonialRecord {
    const testimonial = this.testimonials.find((item) => item.id === id);
    if (!testimonial) {
      throw new NotFoundException({ errorKey: 'testimonial_not_found' });
    }
    return testimonial;
  }

  async updateStatus(id: string, payload: UpdateTestimonialStatusDto): Promise<TestimonialRecord> {
    const testimonial = this.testimonials.find((item) => item.id === id);
    if (!testimonial) {
      throw new NotFoundException({ errorKey: 'testimonial_not_found' });
    }

    testimonial.status = payload.status;
    testimonial.updatedAt = new Date();
    testimonial.moderatorLog.push({
      moderatorId: payload.moderatorId,
      status: payload.status,
      reason: payload.reason,
      timestamp: testimonial.updatedAt
    });

    await this.saveTestimonials();
    return testimonial;
  }
}
