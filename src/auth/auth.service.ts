import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { OnModuleInit } from '@nestjs/common';

@Injectable()
export class AuthService implements OnModuleInit {
    constructor(private dataSource: DataSource) { }

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

    async register(body: any) {
        const {
            clientUserId,
            name,
            email,
            mobile,
            password,
            dob,
            referralCode,
            referenceId
        } = body;

        if (!clientUserId || !email || !password) {
            throw new BadRequestException('Missing required fields');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await this.dataSource.query(
            `
    INSERT INTO users
    (client_user_id, name, email, mobile, password, dob, referral_code, reference_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `,
            [
                clientUserId,
                name,
                email,
                mobile,
                hashedPassword,
                dob || null,
                referralCode || null,
                referenceId || null
            ]
        );

        console.log('USER INSERT RESULT:', result);

        return { msg: 'Registration successful' };
    }

    async importUser(body: any) {
        const {
            clientUserId,
            name,
            email,
            mobile,
            password,
            dob
        } = body;

        const existing = await this.dataSource.query(
            `SELECT id FROM users WHERE email = ?`,
            [email]
        );

        if (existing.length) {
            return { msg: 'User already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await this.dataSource.query(
            `
    INSERT INTO users
    (client_user_id, name, email, mobile, password, dob, status)
    VALUES (?, ?, ?, ?, ?, ?, 'active')
    `,
            [
                clientUserId,
                name,
                email,
                mobile,
                hashedPassword,
                dob ? new Date(dob) : null
            ]
        );

        return { msg: 'User imported successfully' };
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

        return {
            msg: 'Login successful',
            userId: user.id,
            name: user.name,
        };
    }
}















// async onModuleInit() {
//     await this.dataSource.query(`
//       CREATE TABLE IF NOT EXISTS users (
//         id INT PRIMARY KEY AUTO_INCREMENT,
//         client_user_id VARCHAR(50) NOT NULL,
//         name VARCHAR(100),
//         email VARCHAR(100) UNIQUE,
//         mobile VARCHAR(15) UNIQUE,
//         password VARCHAR(255),
//         dob DATE,
//         referral_code VARCHAR(20),
//         reference_id VARCHAR(20),
//         status ENUM('active','inactive') DEFAULT 'active',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);
//   }