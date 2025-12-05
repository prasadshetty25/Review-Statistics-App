import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '@reviews-monorepo/database';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { AverageRatingResponseDto } from './dto/average-rating-response.dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectRepository(Review, 'databaseConnection')
    private readonly reviewRepository: Repository<Review>
  ) {}

  async createReview(
    userId: string,
    createReviewDto: CreateReviewDto
  ): Promise<ReviewResponseDto> {
    try {
      this.logger.log(`Creating review for user: ${userId}`);

      // Checks if user has already commented
      const existingReview = await this.reviewRepository.findOne({
        where: { userId },
      });

      if (existingReview) {
        this.logger.warn(`User ${userId} has already commented`);
        throw new ConflictException('You have already submitted a review');
      }

      const review = this.reviewRepository.create({
        userId,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
      });

      const savedReview = await this.reviewRepository.save(review);

      this.logger.log(`Review created successfully with ID: ${savedReview.id}`);
      return savedReview;
    } catch (error) {
      this.logger.error(
        `Error creating review: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async getAverageRating(): Promise<AverageRatingResponseDto> {
    try {
      this.logger.log('Calculating average rating');

      const result = await this.reviewRepository
        .createQueryBuilder('review')
        .select('AVG(review.rating)', 'averageRating')
        .addSelect('COUNT(review.id)', 'totalReviews')
        .getRawOne();

      const averageRating = parseFloat(result.averageRating) || 0;
      const totalReviews = parseInt(result.totalReviews) || 0;

      this.logger.log(
        `Average rating: ${averageRating}, Total reviews: ${totalReviews}`
      );

      return {
        averageRating: Number(averageRating.toFixed(2)),
        totalReviews,
      };
    } catch (error) {
      this.logger.error(
        `Error calculating average rating: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async getLatestComments(limit: number = 10): Promise<ReviewResponseDto[]> {
    try {
      this.logger.log(`Fetching latest ${limit} comments`);

      const reviews = await this.reviewRepository.find({
        order: {
          createdAt: 'DESC',
        },
        take: limit,
      });

      this.logger.log(`Found ${reviews.length} reviews`);
      return reviews;
    } catch (error) {
      this.logger.error(
        `Error fetching latest comments: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}


