import { Module } from '@nestjs/common';
import { CarDataController } from './controllers/car-data.controller';
import { RepairApisModule } from '../repair-apis/repair-apis.module';

@Module({
  imports: [RepairApisModule],
  controllers: [CarDataController],
})
export class CarDataModule {}
