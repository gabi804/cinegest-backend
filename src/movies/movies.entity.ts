import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  genre!: string; //genero

  @Column()
  duration!: number;

  @Column({ default: false })
  subtitled!: boolean; // true if subtitled to Spanish
  @Column({ default: true })
  active!: boolean;
}

