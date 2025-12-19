import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChooseplanModule } from './chooseplan/chooseplan.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [  TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'gym_db',
      autoLoadEntities: true,
      synchronize: true, 
    }),
    ChooseplanModule,SubscriptionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
