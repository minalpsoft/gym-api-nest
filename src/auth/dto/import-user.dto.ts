import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class ImportUserDto {

  @ApiProperty({ example: '1770624606146' })
  @IsString()
  clientUserId: string;

  @ApiProperty({ example: 'Seems' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'seems1@gmail.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: '7361961245' })
  @IsString()
  mobile: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;

  @ApiProperty({ example: '1998-05-10', required: false })
  @IsOptional()               
  @IsDateString()              
  dob?: string;
}
