import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TestimonialStatus } from '../../common/enums';
import { Testimonial, TestimonialDocument } from '../../schemas/testimonial.schema';
import type { CreateTestimonialDto } from './dto/create-testimonial.dto';
import type { UpdateTestimonialStatusDto } from './dto/update-testimonial-status.dto';

@Injectable()
export class TestimonialsService implements OnModuleInit {
  constructor(
    @InjectModel(Testimonial.name) private testimonialModel: Model<TestimonialDocument>,
  ) {}

  async onModuleInit() {
    const count = await this.testimonialModel.countDocuments();
    console.log(`✅ Loaded ${count} testimonials from MongoDB`);
  }

  async create(payload: CreateTestimonialDto): Promise<TestimonialDocument> {
    const now = new Date();
    const testimonial = await this.testimonialModel.create({
      ...payload,
      status: TestimonialStatus.PENDING,
      moderatorLog: [
        {
          moderatorId: 'system',
          status: TestimonialStatus.PENDING,
          timestamp: now
        }
      ]
    });

    return testimonial;
  }

  async findApproved(): Promise<Omit<TestimonialDocument, 'moderatorLog'>[]> {
    return this.testimonialModel
      .find({ status: TestimonialStatus.APPROVED })
      .select('-moderatorLog')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(): Promise<TestimonialDocument[]> {
    return this.testimonialModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<TestimonialDocument> {
    const testimonial = await this.testimonialModel.findById(id).exec();
    if (!testimonial) {
      throw new NotFoundException({ errorKey: 'testimonial_not_found' });
    }
    return testimonial;
  }

  async updateStatus(id: string, payload: UpdateTestimonialStatusDto): Promise<TestimonialDocument> {
    const now = new Date();
    const testimonial = await this.testimonialModel.findByIdAndUpdate(
      id,
      {
        $set: { status: payload.status, updatedAt: now },
        $push: {
          moderatorLog: {
            moderatorId: payload.moderatorId,
            status: payload.status,
            reason: payload.reason,
            timestamp: now
          }
        }
      },
      { new: true }
    ).exec();

    if (!testimonial) {
      throw new NotFoundException({ errorKey: 'testimonial_not_found' });
    }

    return testimonial;
  }
}
