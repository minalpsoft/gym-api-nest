import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SubscriptionService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS subscription (
        id INT PRIMARY KEY AUTO_INCREMENT,
        client_user_id INT NOT NULL,
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
      clientUserId,
      planId,
      planName,
      price,
      durationDays
    } = body;

    if (!clientUserId || !planId || !planName || !price || !durationDays) {
      throw new BadRequestException('Missing required fields');
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + Number(durationDays));

    const result = await this.dataSource.query(
      `
      INSERT INTO subscription
      (client_user_id, plan_id, plan_name, price, duration, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        clientUserId,
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
      clientUserId,
      planId,
      planName,
      startDate,
      endDate,
      status: 'active'
    };
  }

  async getActiveByUser(clientUserId: number) {
    return this.dataSource.query(
      `
      SELECT *
      FROM subscription
      WHERE client_user_id = ?
        AND status = 'active'
        AND end_date >= CURDATE()
      `,
      [clientUserId]
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
