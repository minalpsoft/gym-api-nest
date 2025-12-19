import { Module } from '@nestjs/common';
import { ChooseplanController } from './chooseplan.controller';
import { ChooseplanService } from './chooseplan.service';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Plan } from './chooseplan.entity';

@Module({
  //  imports: [TypeOrmModule.forFeature([Plan])],
  controllers: [ChooseplanController],
  providers: [ChooseplanService]
})
export class ChooseplanModule {}
