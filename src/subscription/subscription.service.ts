import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Subscription } from "./subscription.entity";
import { Repository } from "typeorm";

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private repo: Repository<Subscription>,
  ) {}

  create(data) {
    return this.repo.save(data);
  }

 async getActivePlan(userId: number) {
  const result = await this.repo.find({
    where: {
      userId: userId,
      status: 'ACTIVE',
    },
    //  relations: ['plan'],
    order: {
      createdAt: 'DESC',
    },
    take: 1,
  });

  return result[0] || null;
}

}
