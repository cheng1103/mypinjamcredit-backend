import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApplicationStatus } from '../../common/enums';
import { CreateLeadDto } from './dto/create-lead.dto';
import { Lead, LeadDocument } from '../../schemas/lead.schema';

@Injectable()
export class LeadsService implements OnModuleInit {
  private readonly submissionTracker = new Map<string, number[]>(); // IP -> timestamps

  constructor(
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
  ) {}

  async onModuleInit() {
    const count = await this.leadModel.countDocuments();
    console.log(`✅ Loaded ${count} leads from MongoDB`);
  }

  private checkSpam(identifier: string): void {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxSubmissions = 3; // Max 3 submissions per minute

    const timestamps = this.submissionTracker.get(identifier) || [];
    const recentTimestamps = timestamps.filter(t => now - t < windowMs);

    if (recentTimestamps.length >= maxSubmissions) {
      throw new BadRequestException({ errorKey: 'too_many_requests' });
    }

    recentTimestamps.push(now);
    this.submissionTracker.set(identifier, recentTimestamps);
  }

  async create(payload: CreateLeadDto, ipAddress?: string): Promise<LeadDocument> {
    // Spam protection - check phone number submissions
    if (payload.phone) {
      this.checkSpam(`phone:${payload.phone}`);
    }

    // Spam protection - check IP address if provided
    if (ipAddress) {
      this.checkSpam(`ip:${ipAddress}`);
    }

    // Note: Duplicate email and phone checks have been disabled
    // All applications will be accepted and stored
    // Admin team can review and handle duplicates in the backend dashboard

    const lead = await this.leadModel.create({
      ...payload,
      loanAmount: Number(payload.loanAmount),
      status: ApplicationStatus.SUBMITTED,
      assignedTo: null,
    });

    return lead;
  }

  async findAll(): Promise<LeadDocument[]> {
    return this.leadModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<LeadDocument | null> {
    return this.leadModel.findById(id).exec();
  }

  async updateStatus(id: string, status: ApplicationStatus): Promise<LeadDocument> {
    const lead = await this.leadModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    ).exec();

    if (!lead) {
      throw new BadRequestException({ errorKey: 'lead_not_found' });
    }

    return lead;
  }

  async assignLead(id: string, adminId: string): Promise<LeadDocument> {
    const lead = await this.leadModel.findByIdAndUpdate(
      id,
      { $set: { assignedTo: adminId } },
      { new: true }
    ).exec();

    if (!lead) {
      throw new BadRequestException({ errorKey: 'lead_not_found' });
    }

    return lead;
  }

  async unassignLead(id: string): Promise<LeadDocument> {
    const lead = await this.leadModel.findByIdAndUpdate(
      id,
      { $set: { assignedTo: null } },
      { new: true }
    ).exec();

    if (!lead) {
      throw new BadRequestException({ errorKey: 'lead_not_found' });
    }

    return lead;
  }

  async updateLead(id: string, updateData: Partial<CreateLeadDto>): Promise<LeadDocument> {
    const lead = await this.leadModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).exec();

    if (!lead) {
      throw new BadRequestException({ errorKey: 'lead_not_found' });
    }

    return lead;
  }

  async deleteLead(id: string): Promise<void> {
    const result = await this.leadModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new BadRequestException({ errorKey: 'lead_not_found' });
    }
  }
}
