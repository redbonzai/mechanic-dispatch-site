import { Module } from '@nestjs/common';
import { MechanicsModule } from '../mechanics/mechanics.module';
import { AdminService } from './services/admin.service';
import {
  AdminMechanicsController,
  AdminReviewsController,
  AdminSkillsController,
} from './controllers';

@Module({
  imports: [MechanicsModule],
  controllers: [
    AdminMechanicsController,
    AdminReviewsController,
    AdminSkillsController,
  ],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}



