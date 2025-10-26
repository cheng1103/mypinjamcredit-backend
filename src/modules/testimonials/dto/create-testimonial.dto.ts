import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Trim, SanitizeHtml } from '../../../common/decorators/trim.decorator';

export class CreateTestimonialDto {
  @Trim()
  @SanitizeHtml()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @Trim()
  @SanitizeHtml()
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  message: string;
}
