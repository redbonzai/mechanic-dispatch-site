import { Injectable } from '@nestjs/common';
import { MechanicsService } from '../../mechanics/services/mechanics.service';
import {
  CreateMechanicData,
  UpdateMechanicData,
  CreateReviewData,
  UpdateReviewData,
} from '../../mechanics/interfaces';

@Injectable()
export class AdminService {
  constructor(private readonly mechanicsService: MechanicsService) {}

  // Mechanics Management
  async getMechanics(isActive?: boolean) {
    return this.mechanicsService.getMechanics(isActive);
  }

  async getMechanic(id: string) {
    return this.mechanicsService.getMechanic(id);
  }

  async createMechanic(data: CreateMechanicData) {
    return this.mechanicsService.createMechanic(data);
  }

  async updateMechanic(id: string, data: UpdateMechanicData) {
    return this.mechanicsService.updateMechanic(id, data);
  }

  async deleteMechanic(id: string) {
    return this.mechanicsService.deleteMechanic(id);
  }

  // Reviews Management
  async createReview(data: CreateReviewData) {
    return this.mechanicsService.createReview(data);
  }

  async updateReview(id: string, data: UpdateReviewData) {
    return this.mechanicsService.updateReview(id, data);
  }

  async deleteReview(id: string) {
    return this.mechanicsService.deleteReview(id);
  }

  // Skills Management
  async getSkills() {
    return this.mechanicsService.getSkills();
  }
}



