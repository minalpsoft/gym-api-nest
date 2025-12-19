import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('chooseplan')
export class Plan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column()
  days: number;

  @Column()
  price: number;
}
