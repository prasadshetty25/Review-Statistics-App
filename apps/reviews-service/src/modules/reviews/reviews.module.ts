import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Log, Review } from '@reviews-monorepo/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review,Log], 'databaseConnection'),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
