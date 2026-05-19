import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'Username',
    minLength: 2,
    maxLength: 40,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  username: string;

  @ApiProperty({
    example: 'secret',
    description: 'Password',
    minLength: 4,
    maxLength: 100,
  })
  @IsString()
  @MinLength(4)
  @MaxLength(100)
  password: string;
}
