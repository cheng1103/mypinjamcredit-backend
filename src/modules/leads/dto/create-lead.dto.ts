import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min, Matches } from 'class-validator';
import { LoanType } from '../../../common/enums';
import { Trim, SanitizeHtml } from '../../../common/decorators/trim.decorator';

export class CreateLeadDto {
  @Trim()
  @SanitizeHtml()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/, {
    message: 'Phone number must be a valid Malaysian phone number (e.g., 012-3456789 or +6012-3456789)'
  })
  phone!: string;

  @Trim()
  @SanitizeHtml()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  occupation?: string;

  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(1000000)
  monthlyIncome?: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1000)
  @Max(500000)
  loanAmount!: number;

  @IsNotEmpty()
  @IsEnum(LoanType)
  loanType!: LoanType;

  @Trim()
  @SanitizeHtml()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @Trim()
  @SanitizeHtml()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}

