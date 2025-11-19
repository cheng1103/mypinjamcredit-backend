import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PageViewDocument = PageView & Document;

@Schema({
  collection: 'pageviews',
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
export class PageView {
  @Prop({ required: true })
  page: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop()
  referer?: string;

  @Prop({ type: Date, default: () => new Date() })
  viewedAt: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PageViewSchema = SchemaFactory.createForClass(PageView);

// Create indexes for better query performance
PageViewSchema.index({ page: 1 });
PageViewSchema.index({ viewedAt: -1 });
PageViewSchema.index({ createdAt: -1 });
