import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UploadedFiles,
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { CreateReviewData } from '../../mechanics/interfaces';
import { CreateReviewDto } from '../../mechanics/dto';
import { ImageUploadInterceptor } from '../../mechanics/decorators';

@Controller('admin/reviews')
export class AdminReviewsController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ImageUploadInterceptor({
    fieldName: 'photos',
    destination: './uploads/reviews',
    filePrefix: 'review',
    maxFiles: 10,
  })
  async createReview(
    @Body() dto: CreateReviewDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const photoUrls =
      files && files.length > 0
        ? files.map((file) => `/uploads/reviews/${file.filename}`)
        : (dto.photoUrls ?? []);
    return this.adminService.createReview({
      ...dto,
      photoUrls,
    } as CreateReviewData);
  }

  @Put(':id')
  @ImageUploadInterceptor({
    fieldName: 'photos',
    destination: './uploads/reviews',
    filePrefix: 'review',
    maxFiles: 10,
  })
  async updateReview(
    @Param('id') id: string,
    @Body() dto: Partial<CreateReviewDto>,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const photoUrls =
      files && files.length > 0
        ? files.map((file) => `/uploads/reviews/${file.filename}`)
        : dto.photoUrls;
    return this.adminService.updateReview(id, {
      ...dto,
      photoUrls,
    } as CreateReviewData);
  }

  @Delete(':id')
  async deleteReview(@Param('id') id: string) {
    await this.adminService.deleteReview(id);
    return { success: true };
  }
}



