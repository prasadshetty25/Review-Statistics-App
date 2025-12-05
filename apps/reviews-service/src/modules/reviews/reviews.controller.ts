import { Controller, Get, Post, Body, HttpCode, HttpStatus, Logger, Query, ParseIntPipe, UseGuards, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { AverageRatingResponseDto } from './dto/average-rating-response.dto';
import { PermissionsGuard, Permissions, Public, CurrentUser } from '@reviews-monorepo/auth';
import { User } from '@reviews-monorepo/database';

@Controller()
@UseGuards(PermissionsGuard) // Apply permissions check after JWT validation
export class ReviewsController {
  private readonly logger = new Logger(ReviewsController.name);
  private readonly maxCommentsLimit: number;
  private readonly defaultCommentsLimit: number;

  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly configService: ConfigService
  ) {
    this.maxCommentsLimit = this.configService.get<number>('app.maxCommentsLimit') || 100;
    this.defaultCommentsLimit = this.configService.get<number>('app.defaultCommentsLimit') || 10;
  }

  @Post('add-comment')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('reviews:create')
  async addComment(
    @CurrentUser() user: User,
    @Body() createReviewDto: CreateReviewDto
  ): Promise<ReviewResponseDto> {
    this.logger.log(`User ${user.username} creating review`);
    return this.reviewsService.createReview(user.id, createReviewDto);
  }

  @Get('average-rating')
  @Public()
  async getAverageRating(): Promise<AverageRatingResponseDto> {
    this.logger.log('GET /average-rating - Fetching average rating');
    return this.reviewsService.getAverageRating();
  }

  @Get('latest-comments')
  @Public()
  async getLatestComments(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<ReviewResponseDto[]> {
    const requestedLimit = limit ?? this.defaultCommentsLimit;

    // Validate limit is positive
    if (requestedLimit < 1) {
      throw new BadRequestException('Limit must be greater than 0');
    }

    // Cap limit at maximum allowed
    const safeLimit = Math.min(requestedLimit, this.maxCommentsLimit);

    if (requestedLimit > this.maxCommentsLimit) {
      this.logger.warn(`Requested limit ${requestedLimit} exceeds max ${this.maxCommentsLimit}, using ${safeLimit}`);
    }

    this.logger.log(`GET /latest-comments - Fetching ${safeLimit} comments`);
    return this.reviewsService.getLatestComments(safeLimit);
  }
}
