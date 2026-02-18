import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { OnModuleInit } from '@nestjs/common';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(private dataSource: DataSource) { }

  private generateReferralCode(name: string): string {
    const prefix = name.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}${randomNum}`;
  }


  async getUserByClientId(clientUserId: string) {
    const users = await this.dataSource.query(
      `SELECT name, email, mobile,referral_code FROM users WHERE client_user_id = ?`,
      [clientUserId]
    );

    if (!users.length) {
      return {
        errCode: 1,
        msg: 'User not found'
      };
    }

    return {
      errCode: 0,
      data: users[0]
    };
  }


  async onModuleInit() {
    await this.dataSource.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      client_user_id VARCHAR(50) NOT NULL,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      mobile VARCHAR(15) UNIQUE,
      password VARCHAR(255),
      dob DATE NULL,
      referral_code VARCHAR(20),
      status ENUM('active','inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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


  async importUser(body: any) {
    try {
      const { clientUserId, name, email, mobile, password, dob } = body;

      const finalDob =
        dob && dob !== '' && dob !== 'null' ? dob : null;

      const hashedPassword = password
        ? await bcrypt.hash(password, 10)
        : null;

      const existing = await this.dataSource.query(
        `SELECT id FROM users WHERE email = ? OR mobile = ?`,
        [email, mobile]
      );

      if (existing.length) {
        await this.dataSource.query(
          `UPDATE users 
         SET name = ?, email = ?, mobile = ?, password = ?, dob = ?
         WHERE email = ? OR mobile = ?`,
          [
            name,
            email,
            mobile,
            hashedPassword,
            finalDob,
            email,
            mobile,
          ]
        );

        return { msg: 'User updated in local DB' };
      }

      await this.dataSource.query(
        `INSERT INTO users 
       (client_user_id, name, email, mobile, password, dob)
       VALUES (?, ?, ?, ?, ?, ?)`,
        [
          clientUserId,
          name,
          email,
          mobile,
          hashedPassword,
          finalDob,
        ]
      );

      return { msg: 'User imported successfully' };

    } catch (err) {
      console.error('IMPORT USER ERROR:', err);
      throw new BadRequestException('Import user failed');
    }
  }


  async login(body: any) {
    const { email, password } = body;

    const users = await this.dataSource.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );

    if (!users.length) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let referralCode = user.referral_code;

    // 🔹 Generate referral code ONLY if not exists
    if (!referralCode) {
      referralCode = this.generateReferralCode(user.name);

      await this.dataSource.query(
        `UPDATE users SET referral_code = ? WHERE id = ?`,
        [referralCode, user.id]
      );
    }

    return {
      msg: 'Login successful',
      // userId: user.id,
      clientUserId: user.client_user_id,
      name: user.name,
      referralCode: referralCode
    };
  }


  async updateUser(body: any) {
    const { clientUserId, name, email, mobile, password } = body;

    let query = `
    UPDATE users
    SET name = ?, email = ?, mobile = ?
  `;
    const params: any[] = [
      name,
      email,
      mobile,
    ];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password = ?`;
      params.push(hashedPassword);
    }

    query += ` WHERE client_user_id = ?`;
    params.push(clientUserId);

    await this.dataSource.query(query, params);

    return { msg: 'User updated successfully' };
  }

  async resetPassword(body: any) {
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    const [user] = await this.dataSource.query(
      `SELECT id FROM users WHERE email = ?`,
      [email]
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.dataSource.query(
      `UPDATE users SET password = ? WHERE email = ?`,
      [hashedPassword, email]
    );

    return { message: 'Password reset successfully' };
  }

  async validateReferral(code: string, planId: number, durationDays: number, refereeId: number) {
    if (durationDays !== 30) {
      return { valid: false, msg: 'Referral discount applies only to 1-month plans' };
    }

    // find referrer by code
    const referrer = await this.dataSource.query(
      `SELECT client_user_id FROM users WHERE referral_code = ?`,
      [code]
    );

    if (!referrer.length) {
      return { valid: false, msg: 'Referral code invalid' };
    }

    const referrerId = Number(referrer[0].client_user_id);

    // ❌ self referral
    if (referrerId === refereeId) {
      return { valid: false, msg: 'You cannot use your own referral code' };
    }

    // ❌ code already used by anyone
    const codeUsed = await this.dataSource.query(
      `SELECT id FROM referrals WHERE referrer_user_id = ?`,
      [referrerId]
    );

    if (codeUsed.length) {
      return { valid: false, msg: 'Referral code already used' };
    }

    return { valid: true, referrerId };
  }

  async applyReferral(referrerId: number, refereeId: number, planId: number) {

    // ❌ referee already used any referral
    const existing = await this.dataSource.query(
      `SELECT id FROM referrals WHERE referee_user_id = ?`,
      [refereeId]
    );

    if (existing.length) {
      return { applied: false, msg: "Referral already used" };
    }

    // ✅ insert referral
    const result = await this.dataSource.query(
      `INSERT INTO referrals 
     (referrer_user_id, referee_user_id, plan_id, discount_applied, referrer_rewarded)
     VALUES (?, ?, ?, true, false)`,
      [referrerId, refereeId, planId]
    );

    // ✅ NOW referrer becomes eligible for reward
    await this.dataSource.query(
      `UPDATE referrals 
     SET referrer_rewarded = true 
     WHERE id = ?`,
      [result.insertId]
    );

    return { applied: true };
  }





}
