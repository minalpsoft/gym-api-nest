import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentService implements OnModuleInit {
  constructor(private dataSource: DataSource) { }

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

    await this.dataSource.query(`
  CREATE TABLE IF NOT EXISTS referrals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    referrer_user_id BIGINT NOT NULL,
    referee_user_id BIGINT NOT NULL,
    plan_id INT NOT NULL,
    discount_applied BOOLEAN DEFAULT false,
    referrer_rewarded BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_referee (referee_user_id)
  )
`);


  }

  async create(body: CreatePaymentDto) {
    let { clientUserId, planId, subscriptionId, amount, transactionId, paymentStatus } = body;

    if (!clientUserId || !planId || !amount || !transactionId) {
      throw new BadRequestException('Missing required fields');
    }

    // 🔹 Check if user has a pending referral reward for this plan
    // const pendingReward = await this.dataSource.query(
    //   `SELECT * FROM referrals 
    //    WHERE referrer_user_id = ? AND referrer_rewarded = true AND plan_id = ?`,
    //   [clientUserId, planId]
    // );
    const pendingReward = await this.dataSource.query(
  `SELECT id FROM referrals 
   WHERE referrer_user_id = ? 
   AND referrer_rewarded = true
   LIMIT 1`,
  [clientUserId]
);


  if (pendingReward.length) {
  amount = Number(amount) / 2;

  await this.dataSource.query(
    `UPDATE referrals 
     SET referrer_rewarded = false 
     WHERE id = ?`,
    [pendingReward[0].id]
  );
}


    // 🔹 Insert payment record
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
      referralDiscountApplied: pendingReward.length > 0,
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

 async getReferrerDiscount(clientUserId: number) {

  const referral = await this.dataSource.query(
    `SELECT id FROM referrals 
     WHERE referrer_user_id = ? 
     AND referrer_rewarded = true`,
    [clientUserId]
  );

  return { hasReward: referral.length > 0 };
}


}
