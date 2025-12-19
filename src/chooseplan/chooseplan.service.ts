import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './chooseplan.entity';

@Injectable()
export class ChooseplanService implements OnModuleInit {
  constructor(
    @InjectRepository(Plan)
    private planRepo: Repository<Plan>,
  ) {}

  async onModuleInit() {
    const count = await this.planRepo.count();

 
  }

  findAll() {
    return this.planRepo.find();
  }
}
