import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 1770624606146 })
  clientUserId: number;

  @ApiProperty({ example: 5 })
  planId: number;

  @ApiProperty({ example: 2, required: false })
  subscriptionId?: number;

  @ApiProperty({ example: 4000 })
  amount: number;

  @ApiProperty({ example: 'TXN_123456789' })
  transactionId: string;

  @ApiProperty({
    example: 'success',
    enum: ['success', 'failed', 'pending'],
    required: false,
  })
  paymentStatus?: 'success' | 'failed' | 'pending';
}
