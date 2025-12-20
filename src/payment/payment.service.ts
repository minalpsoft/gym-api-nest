import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PaymentService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS payment (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        plan_id INT NOT NULL,
        subscription_id INT NULL,
        amount DECIMAL(10,2) NOT NULL,
        transaction_id VARCHAR(100) NOT NULL,
        payment_status ENUM('success','failed','pending') DEFAULT 'pending',
        payment_datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async create(body: any) {
    const {
      userId,
      planId,
      subscriptionId,
      amount,
      transactionId,
      paymentStatus
    } = body;

    if (!userId || !planId || !amount || !transactionId) {
      throw new BadRequestException('Missing required fields');
    }

    const result = await this.dataSource.query(
      `
      INSERT INTO payment
      (user_id, plan_id, subscription_id, amount, transaction_id, payment_status)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        planId,
        subscriptionId || null,
        amount,
        transactionId,
        paymentStatus || 'success'
      ]
    );

    return {
      paymentId: result.insertId,
      userId,
      planId,
      amount,
      transactionId,
      paymentStatus: paymentStatus || 'success'
    };
  }

  async getPaymentsByUser(userId: number) {
    return this.dataSource.query(
      `
      SELECT *
      FROM payment
      WHERE user_id = ?
      ORDER BY payment_datetime DESC
      `,
      [userId]
    );
  }
}
