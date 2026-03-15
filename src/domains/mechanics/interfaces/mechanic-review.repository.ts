import { MechanicReviewProps } from './mechanic-review-props.interface';
import { CreateMechanicReviewData } from './create-mechanic-review-data.interface';

export class MechanicReview {
  private constructor(private readonly props: MechanicReviewProps) {}

  static create(props: MechanicReviewProps): MechanicReview {
    return new MechanicReview(props);
  }

  get id(): string {
    return this.props.id;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get rating(): number {
    return this.props.rating;
  }

  get reviewerName(): string {
    return this.props.reviewerName;
  }

  get reviewerLocation(): string {
    return this.props.reviewerLocation;
  }

  get reviewText(): string {
    return this.props.reviewText;
  }

  get carModel(): string {
    return this.props.carModel;
  }

  get carYear(): number {
    return this.props.carYear;
  }

  get serviceDescription(): string {
    return this.props.serviceDescription;
  }

  get mechanicId(): string {
    return this.props.mechanicId;
  }

  get photoUrls(): string[] {
    return this.props.photoUrls ?? [];
  }

  toJSON(): MechanicReviewProps {
    return { ...this.props };
  }
}

export type UpdateMechanicReviewData = Partial<CreateMechanicReviewData>;
