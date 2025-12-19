import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { Subscription } from './subscription.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([Subscription]), 
    ],
    controllers: [SubscriptionController],
    providers: [SubscriptionService],
})
export class SubscriptionModule { }
