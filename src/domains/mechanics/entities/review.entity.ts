export interface ReviewProps {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  rating: number;
  reviewerName: string;
  reviewerLocation: string;
  reviewText: string;
  carModel: string;
  carYear: number;
  serviceDescription: string;
  mechanicId: string;
  serviceRequestId?: string | null;
  photoUrls?: string[];
}

export class Review {
  private constructor(private readonly props: ReviewProps) {}

  static create(props: ReviewProps): Review {
    return new Review(props);
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

  get serviceRequestId(): string | null | undefined {
    return this.props.serviceRequestId ?? null;
  }

  get photoUrls(): string[] {
    return this.props.photoUrls ?? [];
  }

  toJSON(): ReviewProps {
    return { ...this.props };
  }
}





