export interface CreateMechanicData {
  name: string;
  slug: string;
  bio?: string | null;
  imageUrl?: string | null;
  location: string;
  yearsExperience: number;
  sinceYear: number;
  certifications?: string[];
  badges?: string[];
  skillIds?: string[];
  isActive?: boolean;
}
