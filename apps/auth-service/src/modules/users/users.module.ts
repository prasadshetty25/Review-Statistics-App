import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, Review } from '@reviews-monorepo/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Review], 'databaseConnection'),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
