import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createTypeOrmConfig } from './util/typeorm-factory.config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync(createTypeOrmConfig('database')),
    // Add more database connections as needed:
    // TypeOrmModule.forRootAsync(createTypeOrmConfig('mpf')),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
