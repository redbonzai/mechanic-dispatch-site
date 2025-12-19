import { Inject, Injectable } from '@nestjs/common';
import {
  CreateMechanicData,
  UpdateMechanicData,
  CreateReviewData,
  FindReviewsParams,
  UpdateReviewData,
} from '../interfaces';
import {
  MECHANIC_REPOSITORY,
  MechanicAbstract,
  REVIEW_REPOSITORY,
  ReviewAbstract,
} from '../repositories';
import { SKILL_REPOSITORY, SkillAbstract } from '../skills';

@Injectable()
export class MechanicsService {
  constructor(
    @Inject(MECHANIC_REPOSITORY)
    private readonly mechanicRepository: MechanicAbstract,
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: ReviewAbstract,
    @Inject(SKILL_REPOSITORY)
    private readonly skillRepository: SkillAbstract,
  ) {}

  async getMechanic(id: string) {
    return this.mechanicRepository.findById(id);
  }

  async getMechanicBySlug(slug: string) {
    return this.mechanicRepository.findBySlug(slug);
  }

  async getMechanics(isActive?: boolean) {
    return this.mechanicRepository.findMany({ isActive });
  }

  async getReviews(params: FindReviewsParams) {
    return this.reviewRepository.findMany(params);
  }

  async getReviewStats(mechanicId?: string) {
    return this.reviewRepository.getStats({ mechanicId });
  }

  async createMechanic(data: CreateMechanicData) {
    return this.mechanicRepository.create(data);
  }

  async updateMechanic(id: string, data: UpdateMechanicData) {
    return this.mechanicRepository.update(id, data);
  }

  async deleteMechanic(id: string) {
    return this.mechanicRepository.delete(id);
  }

  async createReview(data: CreateReviewData) {
    return this.reviewRepository.create(data);
  }

  async updateReview(id: string, data: UpdateReviewData) {
    return this.reviewRepository.update(id, data);
  }

  async deleteReview(id: string) {
    return this.reviewRepository.delete(id);
  }

  async getSkills() {
    return this.skillRepository.findMany();
  }
}
