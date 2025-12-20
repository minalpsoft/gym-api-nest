import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SubscriptionService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS subscription (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        plan_id INT NOT NULL,
        plan_name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        duration INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async create(body: any) {
    const {
      userId,
      planId,
      planName,
      price,
      durationDays
    } = body;

    if (!userId || !planId || !planName || !price || !durationDays) {
      throw new BadRequestException('Missing required fields');
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + Number(durationDays));

    const result = await this.dataSource.query(
      `
      INSERT INTO subscription
      (user_id, plan_id, plan_name, price, duration, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        planId,
        planName,
        price,
        durationDays,
        startDate,
        endDate
      ]
    );

    return {
      subscriptionId: result.insertId,
      userId,
      planId,
      planName,
      startDate,
      endDate,
      status: 'active'
    };
  }

  async getActiveByUser(userId: number) {
    return this.dataSource.query(
      `
      SELECT *
      FROM subscription
      WHERE user_id = ?
        AND status = 'active'
        AND end_date >= CURDATE()
      `,
      [userId]
    );
  }

  async expireSubscriptions() {
    return this.dataSource.query(`
      UPDATE subscription
      SET status = 'expired'
      WHERE end_date < CURDATE()
    `);
  }
}
