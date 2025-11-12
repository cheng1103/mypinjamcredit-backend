import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApplicationStatus } from '../../common/enums';
import { CreateLeadDto } from './dto/create-lead.dto';
import { JsonDbService } from '../../common/database/json-db.service';

export type LeadRecord = CreateLeadDto & {
  id: string;
  status: ApplicationStatus;
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class LeadsService implements OnModuleInit {
  private readonly collectionName = 'leads';
  private leads: LeadRecord[] = [];
  private readonly submissionTracker = new Map<string, number[]>(); // IP -> timestamps

  constructor(private readonly db: JsonDbService) {}

  async onModuleInit() {
    // Load existing data from file on startup
    this.leads = await this.db.findAll<LeadRecord>(this.collectionName);
    console.log(`✅ Loaded ${this.leads.length} leads from database`);
  }

  private async saveLeads() {
    await this.db.write(this.collectionName, this.leads);
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

  async create(payload: CreateLeadDto, ipAddress?: string): Promise<LeadRecord> {
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

    const record: LeadRecord = {
      ...payload,
      loanAmount: Number(payload.loanAmount),
      id: randomUUID(),
      status: ApplicationStatus.SUBMITTED,
      assignedTo: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.leads.push(record);
    await this.saveLeads();
    return record;
  }

  findAll(): LeadRecord[] {
    return [...this.leads];
  }

  findOne(id: string): LeadRecord | undefined {
    return this.leads.find((lead) => lead.id === id);
  }

  async updateStatus(id: string, status: ApplicationStatus): Promise<LeadRecord> {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) {
      throw new BadRequestException({ errorKey: 'lead_not_found' });
    }
    lead.status = status;
    lead.updatedAt = new Date();
    await this.saveLeads();
    return lead;
  }

  async assignLead(id: string, adminId: string): Promise<LeadRecord> {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) {
      throw new BadRequestException({ errorKey: 'lead_not_found' });
    }
    lead.assignedTo = adminId;
    lead.updatedAt = new Date();
    await this.saveLeads();
    return lead;
  }

  async unassignLead(id: string): Promise<LeadRecord> {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) {
      throw new BadRequestException({ errorKey: 'lead_not_found' });
    }
    lead.assignedTo = null;
    lead.updatedAt = new Date();
    await this.saveLeads();
    return lead;
  }

  async updateLead(id: string, updateData: Partial<CreateLeadDto>): Promise<LeadRecord> {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) {
      throw new BadRequestException({ errorKey: 'lead_not_found' });
    }

    // Update fields
    Object.assign(lead, updateData);
    lead.updatedAt = new Date();

    await this.saveLeads();
    return lead;
  }

  async deleteLead(id: string): Promise<void> {
    const index = this.leads.findIndex((l) => l.id === id);
    if (index === -1) {
      throw new BadRequestException({ errorKey: 'lead_not_found' });
    }

    this.leads.splice(index, 1);
    await this.saveLeads();
  }
}


