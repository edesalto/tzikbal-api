import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  Matches,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PreferencesDto {
  @ApiPropertyOptional({ description: 'Preferred language', default: 'en' })
  @IsString()
  lang: string = 'en';

  @ApiPropertyOptional({
    description: 'Theme preference',
    enum: ['dark', 'light', 'auto'],
    default: 'auto',
  })
  @IsIn(['dark', 'light', 'auto'])
  theme: 'dark' | 'light' | 'auto' = 'auto';
}

export class CreateUserDto {
  @ApiProperty({ description: 'User name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    description: 'User preferences including language and theme',
    default: { lang: 'en', theme: 'auto' },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences?: PreferencesDto = new PreferencesDto();

  @ApiPropertyOptional({ description: 'Phone number (optional)' })
  @IsOptional()
  @Matches(/^\+?\d{7,15}$/, { message: 'Phone must be a valid number' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Profile picture URL (optional)' })
  @IsOptional()
  picture?: string;
}
