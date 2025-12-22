import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ChooseplanService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS choose_plan (
        id INT PRIMARY KEY AUTO_INCREMENT,
        plan_name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        duration INT NOT NULL,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async create(body: any) {
    const { planName, price, durationDays, status } = body;

    if (!planName || !price || !durationDays || !status) {
      throw new BadRequestException(
        'planName, price, durationDays and status are required'
      );
    }

    const normalizedStatus = status.toLowerCase();

    if (!['active', 'inactive'].includes(normalizedStatus)) {
      throw new BadRequestException('status must be active or inactive');
    }

    const result = await this.dataSource.query(
      `
      INSERT INTO choose_plan (plan_name, price, duration, status)
      VALUES (?, ?, ?, ?)
      `,
      [planName, price, durationDays, normalizedStatus]
    );

    return {
      planId: result.insertId,
      planName,
      price,
      durationDays,
      status: normalizedStatus
    };
  }

  async findAll() {
    return this.dataSource.query(`
      SELECT 
        id,
        plan_name AS label,
        price,
        duration AS days
      FROM choose_plan
      WHERE status = 'active'
      ORDER BY price ASC
    `);
  }
}
