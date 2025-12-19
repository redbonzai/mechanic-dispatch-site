import { FindMechanicReviewsParams } from '../interfaces/find-mechanic-review-params.interface';
import { CreateMechanicReviewData } from '../interfaces/create-mechanic-review-data.interface';
import {
  MechanicReview,
  ReviewStats,
  UpdateMechanicReviewData,
} from '../interfaces';

export abstract class MechanicsReviewAbstract {
  abstract findMany(
    params: FindMechanicReviewsParams,
  ): Promise<MechanicReview[]>;
  abstract findById(id: string): Promise<MechanicReview | null>;
  abstract getStats(params?: { mechanicId?: string }): Promise<ReviewStats>;
  abstract create(data: CreateMechanicReviewData): Promise<MechanicReview>;
  abstract update(
    id: string,
    data: UpdateMechanicReviewData,
  ): Promise<MechanicReview>;
  abstract delete(id: string): Promise<void>;
}

export const REVIEW_REPOSITORY = Symbol('REVIEW_REPOSITORY');
