import { Module } from '@nestjs/common';
import { ConfigModule } from '@reviews-monorepo/config';
import { DatabaseModule } from '@reviews-monorepo/database';
import { LoggerModule } from '@reviews-monorepo/logging';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthController } from './modules/health/health.controller';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    LoggerModule.forRoot(),
    AuthModule,
    UsersModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
