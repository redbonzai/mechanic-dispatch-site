import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { NhtsaService } from '../../repair-apis/services/nhtsa.service';

@Controller('cars')
export class CarDataController {
  constructor(private readonly nhtsaService: NhtsaService) {}

  @Get('makes')
  getAllMakes() {
    return this.nhtsaService.getAllMakes();
  }

  @Get('makes/:make/models/:year')
  getModelsForMakeYear(
    @Param('make') make: string,
    @Param('year', ParseIntPipe) year: number,
  ) {
    return this.nhtsaService.getModelsForMakeYear(make, year);
  }

  @Get('decode-vin/:vin')
  decodeVin(@Param('vin') vin: string) {
    return this.nhtsaService.decodeVin(vin);
  }

  @Get('recalls')
  getRecalls(
    @Query('make') make: string,
    @Query('model') model: string,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.nhtsaService.getRecallsByVehicle(make, model, year);
  }

  @Get('recalls/vin/:vin')
  getRecallsByVin(@Param('vin') vin: string) {
    return this.nhtsaService.getRecallsByVin(vin);
  }
}
