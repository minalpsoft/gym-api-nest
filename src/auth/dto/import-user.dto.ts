import { ApiProperty } from '@nestjs/swagger';

export class ImportUserDto {
  @ApiProperty({ example: '1770624606146' })
  clientUserId: string;

  @ApiProperty({ example: 'Seems' })
  name: string;

  @ApiProperty({ example: 'seems1@gmail.com' })
  email: string;

  @ApiProperty({ example: '7361961245' })
  mobile: string;

  @ApiProperty({ example: 'password123' })
  password: string;

  @ApiProperty({ example: '1998-05-10', required: false })
  dob?: string;
}
