import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/login
   *
   * Exchange credentials for a JWT Bearer token.
   * Demo accounts:  admin / secret   |   readonly / pass1234
   */
  @Post('login')
  @Public()                        // no auth required to log in
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login',
    description:
      'Exchange username + password for a Bearer token.\n\n' +
      '**Demo accounts:**\n' +
      '- `admin` / `secret` → roles: admin, reader\n' +
      '- `readonly` / `pass1234` → roles: reader',
  })
  @ApiOkResponse({
    type: AuthResponseDto,
    description: 'Authentication successful',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  login(@Body() dto: LoginDto): AuthResponseDto {
    return this.authService.login(dto);
  }

  /**
   * POST /api/v1/auth/logout
   *
   * Invalidate the current Bearer token.
   */
  @Post('logout')
  @ApiBearerAuth('jwt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout',
    description: 'Invalidates the current Bearer token.',
  })
  @ApiOkResponse({ description: 'Logged out successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  logout(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '') ?? '';
    this.authService.logout(token);
    return { message: 'Logged out successfully' };
  }
}
