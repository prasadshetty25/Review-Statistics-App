import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@reviews-monorepo/config';
import { DatabaseModule } from '@reviews-monorepo/database';
import { AuthModule, JwtAuthGuard } from '@reviews-monorepo/auth';
import { LoggerModule } from '@reviews-monorepo/logging';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { HealthController } from './modules/health/health.controller';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    LoggerModule.forRoot(),
    AuthModule, // JWT authentication module
    ReviewsModule,
  ],
  controllers: [HealthController],
  providers: [
    // Apply JWT auth guard globally to all routes
    // Routes can opt-out using @Public() decorator
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
