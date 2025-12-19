import { Controller, Get } from '@nestjs/common';
import { AdminService } from '../services/admin.service';

@Controller('admin/skills')
export class AdminSkillsController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async getSkills() {
    return this.adminService.getSkills();
  }
}


