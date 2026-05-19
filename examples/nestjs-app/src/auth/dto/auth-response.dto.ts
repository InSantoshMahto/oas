import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'jwt-token-admin-abc123', description: 'Bearer token to use in Authorization header' })
  accessToken: string;

  @ApiProperty({ example: 3600, description: 'Token lifetime in seconds' })
  expiresIn: number;

  @ApiProperty({ example: 'admin', description: 'Authenticated username' })
  username: string;

  @ApiProperty({ example: ['admin'], description: 'Roles granted to the user', isArray: true })
  roles: string[];
}
