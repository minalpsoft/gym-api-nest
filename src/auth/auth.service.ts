import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
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
            throw new BadRequestException('User not found');
        }

        return users[0];
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
        dob DATE,
        referral_code VARCHAR(20),
        reference_id VARCHAR(20),
        status ENUM('active','inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    }

    // async importUser(body: any) {
    //     const {
    //         clientUserId,
    //         name,
    //         email,
    //         mobile,
    //         password,
    //         dob
    //     } = body;

    //     const existing = await this.dataSource.query(
    //         `SELECT id FROM users WHERE email = ?`,
    //         [email]
    //     );

    //     if (existing.length) {
    //         return { msg: 'User already exists' };
    //     }

    //     const hashedPassword = await bcrypt.hash(password, 10);

    //     await this.dataSource.query(
    //         `
    // INSERT INTO users
    // (client_user_id, name, email, mobile, password, dob, status)
    // VALUES (?, ?, ?, ?, ?, ?, 'active')
    // `,
    //         [
    //             clientUserId,
    //             name,
    //             email,
    //             mobile,
    //             hashedPassword,
    //             dob ? new Date(dob) : null
    //         ]
    //     );

    //     return { msg: 'User imported successfully' };
    // }

  async importUser(body: any) {
    try {
        const { clientUserId, name, email, mobile, password, dob } = body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const existing = await this.dataSource.query(
            `SELECT id FROM users WHERE email = ? OR mobile = ?`,
            [email, mobile]
        );

        if (existing.length) {
            await this.dataSource.query(
                `UPDATE users 
                 SET name = ?, email = ?, mobile = ?, password = ?, dob = ?
                 WHERE email = ? OR mobile = ?`,
                [name, email, mobile, hashedPassword, dob || null, email, mobile]
            );

            return { msg: 'User updated in local DB' };
        }

        await this.dataSource.query(
            `INSERT INTO users 
             (client_user_id, name, email, mobile, password, dob)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [clientUserId, name, email, mobile, hashedPassword, dob || null]
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
        const { clientUserId, name, email, mobile, password, dob } = body;

        const hashedPassword = await bcrypt.hash(password, 10);

        await this.dataSource.query(
            `
        UPDATE users
        SET name = ?, email = ?, mobile = ?, password = ?, dob = ?
        WHERE client_user_id = ?
        `,
            [name, email, mobile, hashedPassword, dob ? new Date(dob) : null, clientUserId]
        );

        return { msg: 'User updated successfully' };
    }

}
