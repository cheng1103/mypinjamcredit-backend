import { IsString, IsOptional } from 'class-validator';

export class TrackPageViewDto {
  @IsString()
  page: string;

  @IsOptional()
  @IsString()
  referrer?: string;
}
