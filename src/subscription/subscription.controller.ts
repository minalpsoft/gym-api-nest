import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';

@ApiTags('subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private service: SubscriptionService) {}

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get('active/:userId')
  getActive(@Param('userId') userId: number) {
    return this.service.getActiveByUser(userId);
  }
}
