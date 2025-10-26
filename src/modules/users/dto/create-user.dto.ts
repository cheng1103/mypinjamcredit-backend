import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { UserRole } from '../../../common/enums';
import { Trim } from '../../../common/decorators/trim.decorator';

export class CreateUserDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username!: string;

  @Trim()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role!: UserRole;
}
