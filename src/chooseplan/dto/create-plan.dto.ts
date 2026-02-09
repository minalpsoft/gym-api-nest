import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanDto {
  @ApiProperty({ example: '1 Week' })
  planName: string;

  @ApiProperty({ example: 999 })
  price: number;

  @ApiProperty({ example: 30 })
  durationDays: number;

    @ApiProperty({ example: 'Active' })
  status: string;
}
