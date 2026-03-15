import { Module } from '@nestjs/common';
import { RepairGuidesService } from './services/repair-guides.service';
import { RepairGuidesController } from './controllers/repair-guides.controller';

@Module({
  controllers: [RepairGuidesController],
  providers: [RepairGuidesService],
  exports: [RepairGuidesService],
})
export class RepairGuidesModule {}
