import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 101 })
  clientUserId: number;

  @ApiProperty({ example: 1 })
  planId: number;

  @ApiProperty({ example: '3 Months' })
  planName: string;

  @ApiProperty({ example: 4000 })
  price: number;

  @ApiProperty({ example: 90 })
  durationDays: number;
}
