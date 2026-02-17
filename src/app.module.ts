import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChooseplanModule } from './chooseplan/chooseplan.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionModule } from './subscription/subscription.module';
import { PaymentModule } from './payment/payment.module';
import { AuthModule } from './auth/auth.module';
import { PaypalModule } from './paypal/paypal.module';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3303,
    username: 'root',
    password: '9126@2156',
    database: 'webaas',
    autoLoadEntities: true,
    synchronize: false,
  }),
    ChooseplanModule, SubscriptionModule, PaymentModule, AuthModule, PaypalModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
