import { Module } from '@nestjs/common';
import { RepairPalAdapter } from './adapters/repairpal.adapter';
import { AllDataAdapter } from './adapters/alldata.adapter';
import { CarMdAdapter } from './adapters/carmd.adapter';
import { NhtsaService } from './services/nhtsa.service';
import { RepairAggregatorService } from './services/repair-aggregator.service';

@Module({
  providers: [
    RepairPalAdapter,
    AllDataAdapter,
    CarMdAdapter,
    NhtsaService,
    RepairAggregatorService,
  ],
  exports: [RepairAggregatorService, NhtsaService],
})
export class RepairApisModule {}
