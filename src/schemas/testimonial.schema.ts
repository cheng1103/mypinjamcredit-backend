import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TestimonialStatus } from '../common/enums';

export type TestimonialDocument = Testimonial & Document;

export class ModeratorLogEntry {
  @Prop({ required: true })
  moderatorId: string;

  @Prop({ required: true, enum: Object.values(TestimonialStatus) })
  status: TestimonialStatus;

  @Prop()
  reason?: string;

  @Prop({ required: true })
  timestamp: Date;
}

@Schema({
  collection: 'testimonials',
  timestamps: true,
  toJSON: {
    transform: (_doc: any, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Testimonial {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  rating?: number;

  @Prop({ required: true, enum: Object.values(TestimonialStatus), default: TestimonialStatus.PENDING })
  status: TestimonialStatus;

  @Prop({ type: [ModeratorLogEntry], default: [] })
  moderatorLog: ModeratorLogEntry[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);

// Create indexes for better query performance
TestimonialSchema.index({ status: 1 });
TestimonialSchema.index({ createdAt: -1 });
