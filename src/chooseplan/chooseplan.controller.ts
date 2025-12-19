import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChooseplanService } from './chooseplan.service';

@ApiTags('Plans')
@Controller('chooseplan')
export class ChooseplanController {
  constructor(private readonly service: ChooseplanService) {}

  @Get()
  async getPlans() {
    const plans = await this.service.findAll();
    return {
      errCode: 0,
      data: plans,
    };
  }
}

