import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CatQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by breed (partial, case-insensitive)',
    example: 'Siamese',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  breed?: string;

  @ApiPropertyOptional({
    description: 'Filter by name (partial, case-insensitive)',
    example: 'Whis',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;
}
