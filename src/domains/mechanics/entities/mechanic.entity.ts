import { MechanicProps } from '../interfaces/mechanic-props.interface';

export class Mechanic {
  private constructor(private readonly props: MechanicProps) {}

  static create(props: MechanicProps): Mechanic {
    return new Mechanic(props);
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

  get name(): string {
    return this.props.name;
  }

  get slug(): string {
    return this.props.slug;
  }

  get bio(): string | null | undefined {
    return this.props.bio ?? null;
  }

  get imageUrl(): string | null | undefined {
    return this.props.imageUrl ?? null;
  }

  get location(): string {
    return this.props.location;
  }

  get yearsExperience(): number {
    return this.props.yearsExperience;
  }

  get rating(): number {
    return this.props.rating;
  }

  get reviewCount(): number {
    return this.props.reviewCount;
  }

  get jobsCompleted(): number {
    return this.props.jobsCompleted;
  }

  get sinceYear(): number {
    return this.props.sinceYear;
  }

  get certifications(): string[] {
    return this.props.certifications;
  }

  get badges(): string[] {
    return this.props.badges;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  toJSON(): MechanicProps {
    return { ...this.props };
  }
}
