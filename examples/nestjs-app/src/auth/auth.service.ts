import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AuthGuard, AuthUser } from '../common/guards/auth.guard';

interface StoredUser {
  id: number;
  username: string;
  password: string; // plain text — demo only; use bcrypt in production
  roles: string[];
}

@Injectable()
export class AuthService {
  /** Hardcoded user store — replace with DB lookup in production */
  private readonly users: StoredUser[] = [
    { id: 1, username: 'admin',    password: 'secret',  roles: ['admin', 'reader'] },
    { id: 2, username: 'readonly', password: 'pass1234', roles: ['reader'] },
  ];

  /**
   * Validate credentials and issue a token.
   *
   * Tokens are stored in AuthGuard.ACTIVE_TOKENS so the global guard can
   * verify them on subsequent requests without a database round-trip.
   */
  login(dto: LoginDto): AuthResponseDto {
    const user = this.users.find(
      (u) => u.username === dto.username && u.password === dto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Generate a simple token — replace with jwt.sign() in production
    const token = `jwt-token-${user.username}-${Date.now().toString(36)}`;

    const authUser: AuthUser = {
      id:       user.id,
      username: user.username,
      roles:    user.roles,
    };

    // Register token so AuthGuard can validate it
    AuthGuard.ACTIVE_TOKENS.set(token, authUser);

    return {
      accessToken: token,
      expiresIn:   3600,
      username:    user.username,
      roles:       user.roles,
    };
  }

  /** Invalidate the caller's token */
  logout(token: string): void {
    AuthGuard.ACTIVE_TOKENS.delete(token);
  }
}
