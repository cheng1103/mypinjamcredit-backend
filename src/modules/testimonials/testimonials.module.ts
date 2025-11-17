import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestimonialsController } from './testimonials.controller';
import { TestimonialsService } from './testimonials.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { Testimonial, TestimonialSchema } from '../../schemas/testimonial.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Testimonial.name, schema: TestimonialSchema }]),
    AuditLogsModule
  ],
  controllers: [TestimonialsController],
  providers: [TestimonialsService],
  exports: [TestimonialsService]
})
export class TestimonialsModule {}
