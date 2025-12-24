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

  @Get('active/:clientUserId')
async getActive(@Param('clientUserId') clientUserId: string) {
  // console.log('API HIT WITH ID:', clientUserId);

  const data = await this.service.getActiveByUser(
    Number(clientUserId)
  );

  // console.log('DB RESULT:', data);
  return data;
}

}
