import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum RoomType {
  TWO_D = '2D',
  THREE_D = '3D',
  VIP = 'VIP',
}

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  capacity: number;

  @Column({ type: 'enum', enum: RoomType })
  type: RoomType;
}

