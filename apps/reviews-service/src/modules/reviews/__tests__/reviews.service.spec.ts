import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { ReviewsService } from '../reviews.service';
import { Review } from '@reviews-monorepo/database';
import { CreateReviewDto } from '../dto/create-review.dto';

describe('ReviewsService', () => {
  let service: ReviewsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getRepositoryToken(Review, 'databaseConnection'),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);

    // Reset all mocks
    jest.clearAllMocks();
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReview', () => {
    const userId = 123;
    const createReviewDto: CreateReviewDto = {
      rating: 5,
      comment: 'Great product!',
    };

    const mockReview: Review = {
      id: 'review-123',
      userId,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a review successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockReview);
      mockRepository.save.mockResolvedValue(mockReview);

      const result = await service.createReview(userId, createReviewDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockReview);
      expect(result).toEqual(mockReview);
    });

    it('should throw ConflictException if user already has a review', async () => {
      const existingReview: Review = {
        id: 'existing-review-123',
        userId,
        rating: 4,
        comment: 'Previous comment',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(existingReview);

      await expect(
        service.createReview(userId, createReviewDto)
      ).rejects.toThrow(ConflictException);
      await expect(
        service.createReview(userId, createReviewDto)
      ).rejects.toThrow('You have already submitted a review');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      mockRepository.findOne.mockRejectedValue(error);

      await expect(
        service.createReview(userId, createReviewDto)
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('getAverageRating', () => {
    it('should return average rating and total reviews', async () => {
      const mockResult = {
        averageRating: '4.5',
        totalReviews: '10',
      };

      mockQueryBuilder.getRawOne.mockResolvedValue(mockResult);

      const result = await service.getAverageRating();

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('review');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        'AVG(review.rating)',
        'averageRating'
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
        'COUNT(review.id)',
        'totalReviews'
      );
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
      expect(result).toEqual({
        averageRating: 4.5,
        totalReviews: 10,
      });
    });

    it('should return 0 for average rating and total reviews when no reviews exist', async () => {
      const mockResult = {
        averageRating: null,
        totalReviews: '0',
      };

      mockQueryBuilder.getRawOne.mockResolvedValue(mockResult);

      const result = await service.getAverageRating();

      expect(result).toEqual({
        averageRating: 0,
        totalReviews: 0,
      });
    });

    it('should round average rating to 2 decimal places', async () => {
      const mockResult = {
        averageRating: '4.56789',
        totalReviews: '3',
      };

      mockQueryBuilder.getRawOne.mockResolvedValue(mockResult);

      const result = await service.getAverageRating();

      expect(result.averageRating).toBe(4.57);
      expect(result.totalReviews).toBe(3);
    });

    it('should handle database errors', async () => {
      const error = new Error('Query failed');
      mockQueryBuilder.getRawOne.mockRejectedValue(error);

      await expect(service.getAverageRating()).rejects.toThrow('Query failed');
    });
  });

  describe('getLatestComments', () => {
    const mockReviews: Review[] = [
      {
        id: 'review-1',
        userId: 1,
        rating: 5,
        comment: 'Excellent!',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      },
      {
        id: 'review-2',
        userId: 2,
        rating: 4,
        comment: 'Very good',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
      {
        id: 'review-3',
        userId: 3,
        rating: 3,
        comment: 'Average',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];

    it('should return latest comments with default limit', async () => {
      mockRepository.find.mockResolvedValue(mockReviews);

      const result = await service.getLatestComments();

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: {
          createdAt: 'DESC',
        },
        take: 10,
      });
      expect(result).toEqual(mockReviews);
    });

    it('should return latest comments with custom limit', async () => {
      const customLimit = 5;
      const limitedReviews = mockReviews.slice(0, Math.min(customLimit, mockReviews.length));
      mockRepository.find.mockResolvedValue(limitedReviews);

      const result = await service.getLatestComments(customLimit);

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: {
          createdAt: 'DESC',
        },
        take: customLimit,
      });
      expect(result).toHaveLength(limitedReviews.length);
    });

    it('should return empty array when no reviews exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.getLatestComments();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const error = new Error('Query failed');
      mockRepository.find.mockRejectedValue(error);

      await expect(service.getLatestComments()).rejects.toThrow('Query failed');
    });
  });
});

