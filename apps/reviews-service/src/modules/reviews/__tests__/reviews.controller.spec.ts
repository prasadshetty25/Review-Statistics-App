import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ReviewsController } from '../reviews.controller';
import { ReviewsService } from '../reviews.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { ReviewResponseDto } from '../dto/review-response.dto';
import { AverageRatingResponseDto } from '../dto/average-rating-response.dto';
import { User } from '@reviews-monorepo/database';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: ReviewsService;

  const mockReviewsService = {
    createReview: jest.fn(),
    getAverageRating: jest.fn(),
    getLatestComments: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockUser: User = {
    id: 123,
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
    permissions: ['reviews:create'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: mockReviewsService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
    service = module.get<ReviewsService>(ReviewsService);

    // Setup default config values
    mockConfigService.get.mockImplementation((key: string) => {
      const defaults: Record<string, any> = {
        'app.maxCommentsLimit': 100,
        'app.defaultCommentsLimit': 10,
      };
      return defaults[key];
    });

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addComment', () => {
    const createReviewDto: CreateReviewDto = {
      rating: 5,
      comment: 'Great product!',
    };

    const mockReviewResponse: ReviewResponseDto = {
      id: 'review-123',
      userId: mockUser.id,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
      createdAt: new Date(),
    };

    it('should create a review successfully', async () => {
      mockReviewsService.createReview.mockResolvedValue(mockReviewResponse);

      const result = await controller.addComment(mockUser, createReviewDto);

      expect(service.createReview).toHaveBeenCalledWith(
        mockUser.id,
        createReviewDto
      );
      expect(result).toEqual(mockReviewResponse);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockReviewsService.createReview.mockRejectedValue(error);

      await expect(
        controller.addComment(mockUser, createReviewDto)
      ).rejects.toThrow('Service error');
    });
  });

  describe('getAverageRating', () => {
    const mockAverageRating: AverageRatingResponseDto = {
      averageRating: 4.5,
      totalReviews: 10,
    };

    it('should return average rating', async () => {
      mockReviewsService.getAverageRating.mockResolvedValue(mockAverageRating);

      const result = await controller.getAverageRating();

      expect(service.getAverageRating).toHaveBeenCalled();
      expect(result).toEqual(mockAverageRating);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockReviewsService.getAverageRating.mockRejectedValue(error);

      await expect(controller.getAverageRating()).rejects.toThrow(
        'Service error'
      );
    });
  });

  describe('getLatestComments', () => {
    const mockComments: ReviewResponseDto[] = [
      {
        id: 'review-1',
        userId: 1,
        rating: 5,
        comment: 'Excellent!',
        createdAt: new Date('2024-01-03'),
      },
      {
        id: 'review-2',
        userId: 2,
        rating: 4,
        comment: 'Very good',
        createdAt: new Date('2024-01-02'),
      },
    ];

    it('should return latest comments with default limit', async () => {
      mockReviewsService.getLatestComments.mockResolvedValue(mockComments);

      const result = await controller.getLatestComments();

      expect(service.getLatestComments).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockComments);
    });

    it('should return latest comments with custom limit', async () => {
      const customLimit = 5;
      const limitedComments = mockComments.slice(0, Math.min(customLimit, mockComments.length));
      mockReviewsService.getLatestComments.mockResolvedValue(limitedComments);

      const result = await controller.getLatestComments(customLimit);

      expect(service.getLatestComments).toHaveBeenCalledWith(customLimit);
      expect(result).toHaveLength(limitedComments.length);
    });

    it('should use default limit when limit is not provided', async () => {
      mockReviewsService.getLatestComments.mockResolvedValue(mockComments);

      const result = await controller.getLatestComments(undefined);

      expect(service.getLatestComments).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockComments);
    });

    it('should cap limit at maxCommentsLimit', async () => {
      const requestedLimit = 150;
      const maxLimit = 100;
      mockConfigService.get.mockReturnValue(maxLimit);
      mockReviewsService.getLatestComments.mockResolvedValue(mockComments);

      const result = await controller.getLatestComments(requestedLimit);

      expect(service.getLatestComments).toHaveBeenCalledWith(maxLimit);
      expect(result).toEqual(mockComments);
    });

    it('should use custom maxCommentsLimit from config', async () => {
      const customMaxLimit = 50;
      // Create a new controller instance with the custom config
      const customConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'app.maxCommentsLimit') return customMaxLimit;
          if (key === 'app.defaultCommentsLimit') return 10;
          return undefined;
        }),
      };
      const customController = new ReviewsController(
        service,
        customConfigService as any
      );
      mockReviewsService.getLatestComments.mockResolvedValue(mockComments);

      const result = await customController.getLatestComments(75);

      expect(service.getLatestComments).toHaveBeenCalledWith(customMaxLimit);
      expect(result).toEqual(mockComments);
    });

    it('should use custom defaultCommentsLimit from config', async () => {
      const customDefaultLimit = 20;
      // Create a new controller instance with the custom config
      const customConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'app.maxCommentsLimit') return 100;
          if (key === 'app.defaultCommentsLimit') return customDefaultLimit;
          return undefined;
        }),
      };
      const customController = new ReviewsController(
        service,
        customConfigService as any
      );
      mockReviewsService.getLatestComments.mockResolvedValue(mockComments);

      const result = await customController.getLatestComments();

      expect(service.getLatestComments).toHaveBeenCalledWith(
        customDefaultLimit
      );
      expect(result).toEqual(mockComments);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockReviewsService.getLatestComments.mockRejectedValue(error);

      await expect(controller.getLatestComments()).rejects.toThrow(
        'Service error'
      );
    });
  });
});

