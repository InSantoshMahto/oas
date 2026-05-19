import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateCatDto {
  @ApiProperty({
    example: 'Whiskers',
    description: 'Name of the cat (2–50 characters)',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: 3,
    description: 'Age in years (0–30)',
    minimum: 0,
    maximum: 30,
  })
  @IsInt()
  @Min(0)
  @Max(30)
  age: number;

  @ApiProperty({
    example: 'Siamese',
    description: 'Breed of the cat',
    minLength: 2,
    maxLength: 80,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  breed: string;

  @ApiPropertyOptional({
    example: 'white',
    description: 'Coat colour (letters and spaces only)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z\s]+$/, { message: 'color must contain only letters and spaces' })
  color?: string;
}
