import { Controller, Get, Param, Query } from '@nestjs/common';
import { MechanicsService } from '../services/mechanics.service';
import { FindReviewsParams } from '../interfaces';

@Controller('mechanics')
export class MechanicsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  @Get()
  async findAll(@Query('isActive') isActive?: string) {
    const active =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    const mechanics = await this.mechanicsService.getMechanics(active);
    // Map entity instances to plain objects for JSON serialization
    return mechanics.map((mechanic) => ({
      id: mechanic.id,
      createdAt: mechanic.createdAt,
      updatedAt: mechanic.updatedAt,
      name: mechanic.name,
      slug: mechanic.slug,
      bio: mechanic.bio,
      imageUrl: mechanic.imageUrl,
      location: mechanic.location,
      yearsExperience: mechanic.yearsExperience,
      rating: mechanic.rating,
      reviewCount: mechanic.reviewCount,
      sinceYear: mechanic.sinceYear,
      certifications: mechanic.certifications,
      badges: mechanic.badges,
      isActive: mechanic.isActive,
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const mechanic = await this.mechanicsService.getMechanic(id);
    if (!mechanic) return null;
    return {
      id: mechanic.id,
      createdAt: mechanic.createdAt,
      updatedAt: mechanic.updatedAt,
      name: mechanic.name,
      slug: mechanic.slug,
      bio: mechanic.bio,
      imageUrl: mechanic.imageUrl,
      location: mechanic.location,
      yearsExperience: mechanic.yearsExperience,
      rating: mechanic.rating,
      reviewCount: mechanic.reviewCount,
      sinceYear: mechanic.sinceYear,
      certifications: mechanic.certifications,
      badges: mechanic.badges,
      isActive: mechanic.isActive,
    };
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const mechanic = await this.mechanicsService.getMechanicBySlug(slug);
    if (!mechanic) return null;
    return {
      id: mechanic.id,
      createdAt: mechanic.createdAt,
      updatedAt: mechanic.updatedAt,
      name: mechanic.name,
      slug: mechanic.slug,
      bio: mechanic.bio,
      imageUrl: mechanic.imageUrl,
      location: mechanic.location,
      yearsExperience: mechanic.yearsExperience,
      rating: mechanic.rating,
      reviewCount: mechanic.reviewCount,
      sinceYear: mechanic.sinceYear,
      certifications: mechanic.certifications,
      badges: mechanic.badges,
      isActive: mechanic.isActive,
    };
  }
}

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  @Get()
  async findAll(
    @Query('mechanicId') mechanicId?: string,
    @Query('rating') rating?: string,
    @Query('service') service?: string,
    @Query('vehicleMake') vehicleMake?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    const params: FindReviewsParams = {
      mechanicId,
      rating: rating ? parseInt(rating, 10) : undefined,
      serviceDescription: service,
      vehicleMake,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      sortBy: sortBy as FindReviewsParams['sortBy'],
    };

    const reviews = await this.mechanicsService.getReviews(params);
    // Map entity instances to plain objects for JSON serialization
    return reviews.map((review) => ({
      id: review.id,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      rating: review.rating,
      reviewerName: review.reviewerName,
      reviewerLocation: review.reviewerLocation,
      reviewText: review.reviewText,
      carModel: review.carModel,
      carYear: review.carYear,
      serviceDescription: review.serviceDescription,
      mechanicId: review.mechanicId,
      photoUrls: review.photoUrls,
    }));
  }

  @Get('stats')
  async getStats(@Query('mechanicId') mechanicId?: string) {
    return this.mechanicsService.getReviewStats(mechanicId);
  }
}
