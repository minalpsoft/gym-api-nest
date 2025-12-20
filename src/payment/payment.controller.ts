import {
  Body,
  Controller,
  Get,
  Param,
  Post
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create payment record' })
  async createPayment(@Body() body: any) {
    return this.paymentService.create(body);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get payment history by user' })
  async getPaymentsByUser(@Param('userId') userId: number) {
    return this.paymentService.getPaymentsByUser(Number(userId));
  }
}
