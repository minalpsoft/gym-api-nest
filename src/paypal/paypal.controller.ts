import { Controller, Post, Body } from '@nestjs/common';
import { PaypalService } from './paypal.service';

@Controller('paypal')
export class PaypalController {
  constructor(private readonly paypalService: PaypalService) {}

  @Post('create-order')
  async createOrder(@Body() body: { amount: string }) {
    const order = await this.paypalService.createOrder(body.amount);

    const approvalLink = order.links.find(
      (link) => link.rel === 'approve'
    );

    return {
      id: order.id,
      approvalUrl: approvalLink.href,
    };
  }


@Post('get-order')
async getOrder(@Body() body: { orderId: string }) {
  return this.paypalService.getOrder(body.orderId);
}

@Post('capture')
async capture(@Body() body: { orderId: string }) {
  return this.paypalService.captureOrder(body.orderId);
}


}
