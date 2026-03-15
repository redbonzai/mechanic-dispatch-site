export interface MechanicProps {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  slug: string;
  bio?: string | null;
  imageUrl?: string | null;
  location: string;
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  sinceYear: number;
  certifications: string[];
  badges: string[];
  isActive: boolean;
}
