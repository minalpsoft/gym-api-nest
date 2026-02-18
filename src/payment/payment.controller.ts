import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/payment.dto';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post()
  @ApiOperation({ summary: 'Create payment record' })
  createPayment(@Body() body: CreatePaymentDto) {
    return this.paymentService.create(body);
  }


  @Get('user/:userId')
  @ApiOperation({ summary: 'Get payment history by user' })
  async getPaymentsByUser(
    @Param('userId') userId: string, // ✅ FIXED
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return this.paymentService.getPaymentsByUser(
      Number(userId),
      startDate,
      endDate,
    );
  }

  @Get('referrer-discount/:userId')
getReferrerDiscount(@Param('userId') userId: number) {
  return this.paymentService.getReferrerDiscount(Number(userId));
}



}
