import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UploadedFiles,
  Get,
  Query,
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { CreateMechanicData } from '../../mechanics/interfaces';
import { CreateMechanicDto } from '../../mechanics/dto';
import { ImageUploadInterceptor } from '../../mechanics/decorators';

@Controller('admin/mechanics')
export class AdminMechanicsController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async getMechanics(@Query('isActive') isActive?: string) {
    let active: boolean | undefined;
    if (isActive === 'true') {
      active = true;
    } else if (isActive === 'false') {
      active = false;
    }
    // active remains undefined if isActive is not 'true' or 'false'
    return this.adminService.getMechanics(active);
  }

  @Get(':id')
  async getMechanic(@Param('id') id: string) {
    return this.adminService.getMechanic(id);
  }

  @Post()
  @ImageUploadInterceptor({
    fieldName: 'image',
    destination: './uploads/mechanics',
    filePrefix: 'mechanic',
    maxFiles: 1,
  })
  async createMechanic(
    @Body() dto: CreateMechanicDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const imageUrl =
      files && files.length > 0
        ? `/uploads/mechanics/${files[0].filename}`
        : dto.imageUrl;
    return this.adminService.createMechanic({
      ...dto,
      imageUrl,
    } as CreateMechanicData);
  }

  @Put(':id')
  @ImageUploadInterceptor({
    fieldName: 'image',
    destination: './uploads/mechanics',
    filePrefix: 'mechanic',
    maxFiles: 1,
  })
  async updateMechanic(
    @Param('id') id: string,
    @Body() dto: Partial<CreateMechanicDto>,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const imageUrl =
      files && files.length > 0
        ? `/uploads/mechanics/${files[0].filename}`
        : dto.imageUrl;
    return this.adminService.updateMechanic(id, {
      ...dto,
      imageUrl,
    } as CreateMechanicData);
  }

  @Delete(':id')
  async deleteMechanic(@Param('id') id: string) {
    await this.adminService.deleteMechanic(id);
    return { success: true };
  }
}
