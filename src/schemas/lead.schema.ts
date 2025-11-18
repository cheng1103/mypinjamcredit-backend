import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApplicationStatus } from '../common/enums';

export type LeadDocument = Lead & Document;

@Schema({
  collection: 'leads',
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
export class Lead {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  email?: string;

  @Prop({ required: true })
  loanAmount: number;

  @Prop()
  loanType?: string;

  @Prop()
  occupation?: string;

  @Prop()
  monthlyIncome?: number;

  @Prop()
  location?: string;

  @Prop({ required: true, enum: Object.values(ApplicationStatus), default: ApplicationStatus.SUBMITTED })
  status: ApplicationStatus;

  @Prop({ type: String, default: null })
  assignedTo: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

// Create indexes for better query performance
LeadSchema.index({ phone: 1 });
LeadSchema.index({ email: 1 });
LeadSchema.index({ status: 1 });
LeadSchema.index({ assignedTo: 1 });
LeadSchema.index({ createdAt: -1 });
