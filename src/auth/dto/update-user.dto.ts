import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Seems Ingale' })
  name?: string;

  @ApiPropertyOptional({ example: 'seems2@gmail.com' })
  email?: string;

  @ApiPropertyOptional({ example: '7361961245' })
  mobile?: string;
}
