import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtUserGuard } from '../guards/jwt-user.guard';
import { VehiclesService } from '../services/vehicles.service';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';

@Controller('users/me/vehicles')
@UseGuards(JwtUserGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  findAll(@Req() req: { user: { id: string } }) {
    return this.vehiclesService.findAllForUser(req.user.id);
  }

  @Post()
  create(
    @Req() req: { user: { id: string } },
    @Body() dto: CreateVehicleDto,
  ) {
    return this.vehiclesService.create(req.user.id, dto);
  }

  @Patch(':id')
  update(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.vehiclesService.remove(req.user.id, id);
  }
}
