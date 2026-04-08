import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { FunctionEntity } from '../functions/functions.entity';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => FunctionEntity)
  @JoinColumn({ name: 'functionId' })
  function!: FunctionEntity;

  @Column()
  seats!: number; //asientos

  @Column({ nullable: true })
  functionDate!: string;

  @Column({ nullable: true })
  functionTime!: string;

  @Column('decimal', { nullable: true })
  functionPrice!: number;

  @Column({ type: 'enum', enum: ReservationStatus, default: ReservationStatus.PENDING })
  status!: ReservationStatus; //estado

  @Column({ default: true })
  active!: boolean;
}


