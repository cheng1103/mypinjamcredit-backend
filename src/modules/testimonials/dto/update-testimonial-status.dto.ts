import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TestimonialStatus } from '../../../common/enums';

export class UpdateTestimonialStatusDto {
  @IsNotEmpty()
  @IsString()
  moderatorId!: string;

  @IsNotEmpty()
  @IsEnum(TestimonialStatus)
  status!: TestimonialStatus;

  @IsString()
  reason?: string;
}

