import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Represents a single cat resource returned by the API. */
export class Cat {
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  id: number;

  @ApiProperty({ example: 'Whiskers', description: 'Name of the cat' })
  name: string;

  @ApiProperty({ example: 3, minimum: 0, maximum: 30, description: 'Age in years' })
  age: number;

  @ApiProperty({ example: 'Siamese', description: 'Breed of the cat' })
  breed: string;

  @ApiPropertyOptional({ example: 'white', description: 'Coat colour' })
  color?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
