import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MechanicsService } from './services/mechanics.service';
import {
  MechanicsController,
  ReviewsController,
} from './controllers/mechanics.controller';
import {
  MECHANIC_REPOSITORY,
  REVIEW_REPOSITORY,
  SKILL_REPOSITORY,
} from './repositories';
import { PrismaMechanicService } from './prisma-mechanic.service';
import { PrismaReviewService } from './prisma-review.service';
import { PrismaSkillService } from './skills';

@Module({
  imports: [DatabaseModule],
  controllers: [MechanicsController, ReviewsController],
  providers: [
    MechanicsService,
    {
      provide: MECHANIC_REPOSITORY,
      useClass: PrismaMechanicService,
    },
    {
      provide: REVIEW_REPOSITORY,
      useClass: PrismaReviewService,
    },
    {
      provide: SKILL_REPOSITORY,
      useClass: PrismaSkillService,
    },
  ],
  exports: [MechanicsService],
})
export class MechanicsModule {}
