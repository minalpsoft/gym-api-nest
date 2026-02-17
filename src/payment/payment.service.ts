import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS payment (
        id INT PRIMARY KEY AUTO_INCREMENT,
        client_user_id BIGINT NOT NULL,
        plan_id INT NOT NULL,
        subscription_id INT NULL,
        amount DECIMAL(10,2) NOT NULL,
        transaction_id VARCHAR(100) NOT NULL,
        payment_status ENUM('success','failed','pending') DEFAULT 'pending',
        payment_datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async create(body: CreatePaymentDto) {
    const { clientUserId, planId, subscriptionId, amount, transactionId, paymentStatus } = body;

    if (!clientUserId || !planId || !amount || !transactionId) {
      throw new BadRequestException('Missing required fields');
    }

    const result = await this.dataSource.query(
      `INSERT INTO payment
       (client_user_id, plan_id, subscription_id, amount, transaction_id, payment_status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [clientUserId, planId, subscriptionId ?? null, amount, transactionId, paymentStatus ?? 'success']
    );

    return {
      paymentId: result.insertId,
      clientUserId,
      planId,
      subscriptionId,
      amount,
      transactionId,
      paymentStatus: paymentStatus ?? 'success',
    };
  }

  async getPaymentsByUser(userId: number, startDate?: string, endDate?: string) {
    let sql = `SELECT * FROM payment WHERE client_user_id = ?`;
    const params: any[] = [userId];

    if (startDate) {
      sql += ` AND payment_datetime >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND payment_datetime <= ?`;
      params.push(endDate);
    }
    sql += ` ORDER BY payment_datetime DESC`;

    return this.dataSource.query(sql, params);
  }
}
