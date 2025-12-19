import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SubscriptionService } from "./subscription.service";

@ApiTags('subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private service: SubscriptionService) {}

  @Post()
  saveSubscription(@Body() body) {
    return {
      errCode: 0,
      data: this.service.create(body),
    };
  }

  @Get(':userId')
  async getUserPlan(@Param('userId') userId: number) {
    const plan = await this.service.getActivePlan(userId);

    return {
      errCode: 0,
      data: plan,
    };
  }
}
