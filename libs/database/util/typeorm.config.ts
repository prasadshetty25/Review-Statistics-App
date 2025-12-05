import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Review } from '../postgres/entities/review.entity';

export const getTypeOrmConfig = (
  configService: ConfigService
): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'postgres'),
    password: configService.get('DB_PASSWORD', 'postgres'),
    database: configService.get('DB_NAME', 'reviews_db'),
    entities: [Review],
    synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
    logging: configService.get('DB_LOGGING') === 'true',
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    migrationsRun: false,
    ssl: configService.get('DB_SSL') === 'true' ? {
      rejectUnauthorized: configService.get('DB_SSL_REJECT_UNAUTHORIZED') !== 'false',
    } : false,

  };
};
