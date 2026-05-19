import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CatsModule } from './cats/cats.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { AuthGuard } from './common/guards/auth.guard';

@Module({
  imports: [CatsModule, AuthModule, HealthModule],
  providers: [
    // Apply AuthGuard globally; individual handlers opt-out with @Public()
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
