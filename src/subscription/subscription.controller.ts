import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/subscription.dto';

@ApiTags('subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private service: SubscriptionService) { }

  @Get('active/:clientUserId')
  async getActive(@Param('clientUserId') clientUserId: string) {
    return this.service.getActiveByUser(clientUserId);
  }

  @Post()
  create(@Body() body: CreateSubscriptionDto) {
    return this.service.create(body);
  }


}
