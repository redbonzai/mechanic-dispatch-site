import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateReviewData,
  FindReviewsParams,
  ReviewStats,
  UpdateReviewData,
  MechanicReview,
} from '../interfaces';
import { ReviewAbstract } from '../repositories';

type ReviewRecord = Prisma.ReviewGetPayload<Prisma.ReviewDefaultArgs>;

@Injectable()
export class PrismaReviewRepository implements ReviewAbstract {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params: FindReviewsParams): Promise<MechanicReview[]> {
    const where: Prisma.ReviewWhereInput = {};

    if (params.mechanicId) {
      where.mechanicId = params.mechanicId;
    }

    if (params.rating) {
      where.rating = params.rating;
    }

    if (params.serviceDescription) {
      where.serviceDescription = {
        contains: params.serviceDescription,
        mode: 'insensitive',
      };
    }

    if (params.vehicleMake) {
      where.carModel = {
        contains: params.vehicleMake,
        mode: 'insensitive',
      };
    }

    const orderBy: Prisma.ReviewOrderByWithRelationInput[] = [];

    switch (params.sortBy) {
      case 'newest':
        orderBy.push({ createdAt: 'desc' });
        break;
      case 'oldest':
        orderBy.push({ createdAt: 'asc' });
        break;
      case 'highest':
        orderBy.push({ rating: 'desc' });
        break;
      case 'lowest':
        orderBy.push({ rating: 'asc' });
        break;
      default:
        orderBy.push({ createdAt: 'desc' });
    }

    const reviews = await this.prisma.review.findMany({
      where,
      orderBy,
      take: params.limit ?? 100,
      skip: params.offset ?? 0,
    });

    return reviews.map((review) => this.mapToDomain(review));
  }

  async findById(id: string): Promise<MechanicReview | null> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return null;
    }

    return this.mapToDomain(review);
  }

  async getStats(params?: { mechanicId?: string }): Promise<ReviewStats> {
    const where: Prisma.ReviewWhereInput = params?.mechanicId
      ? { mechanicId: params.mechanicId }
      : {};

    const [count, aggregate] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.aggregate({
        where,
        _avg: { rating: true },
      }),
    ]);

    return {
      totalReviews: count,
      averageRating: aggregate._avg.rating ?? 0,
    };
  }

  async create(data: CreateReviewData): Promise<MechanicReview> {
    const review = await this.prisma.review.create({
      data: {
        rating: data.rating,
        reviewerName: data.reviewerName,
        reviewerLocation: data.reviewerLocation,
        reviewText: data.reviewText,
        carModel: data.carModel,
        carYear: data.carYear,
        serviceDescription: data.serviceDescription,
        mechanicId: data.mechanicId,
        photoUrls: data.photoUrls ?? [],
      },
    });

    // Update mechanic stats
    await this.updateMechanicStats(data.mechanicId);

    return this.mapToDomain(review);
  }

  async update(id: string, data: UpdateReviewData): Promise<MechanicReview> {
    const review = await this.prisma.review.update({
      where: { id },
      data: {
        rating: data.rating,
        reviewerName: data.reviewerName,
        reviewerLocation: data.reviewerLocation,
        reviewText: data.reviewText,
        carModel: data.carModel,
        carYear: data.carYear,
        serviceDescription: data.serviceDescription,
        photoUrls: data.photoUrls,
      },
    });

    // Update mechanic stats if mechanic changed
    if (data.mechanicId) {
      await this.updateMechanicStats(data.mechanicId);
    }

    return this.mapToDomain(review);
  }

  async delete(id: string): Promise<void> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      select: { mechanicId: true },
    });

    await this.prisma.review.delete({
      where: { id },
    });

    // Update mechanic stats
    if (review) {
      await this.updateMechanicStats(review.mechanicId);
    }
  }

  private async updateMechanicStats(mechanicId: string): Promise<void> {
    const stats = await this.getStats({ mechanicId });
    await this.prisma.mechanic.update({
      where: { id: mechanicId },
      data: {
        rating: stats.averageRating,
        reviewCount: stats.totalReviews,
      },
    });
  }

  private mapToDomain(record: ReviewRecord): MechanicReview {
    return MechanicReview.create({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      rating: record.rating,
      reviewerName: record.reviewerName,
      reviewerLocation: record.reviewerLocation,
      reviewText: record.reviewText,
      carModel: record.carModel,
      carYear: record.carYear,
      serviceDescription: record.serviceDescription,
      mechanicId: record.mechanicId,
      photoUrls: record.photoUrls ?? [],
    });
  }
}
