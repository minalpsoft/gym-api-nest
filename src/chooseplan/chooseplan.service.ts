import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ChooseplanService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS choose_plan (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        duration INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

async create(body: any) {
  const { planName, price, durationDays } = body;

  if (!planName || !price || !durationDays) {
    throw new Error('planName, price and durationDays are required');
  }

  const result = await this.dataSource.query(
    `
    INSERT INTO choose_plan (name, price, duration)
    VALUES (?, ?, ?)
    `,
    [planName, price, durationDays]
  );

  return {
    planId: result.insertId,
    planName,
    price,
    durationDays,
  };
}


 async findAll() {
  const plans = await this.dataSource.query(`
    SELECT 
      id,
      name AS label,
      price,
      duration AS days
    FROM choose_plan
  `);

  return plans;
}

}
