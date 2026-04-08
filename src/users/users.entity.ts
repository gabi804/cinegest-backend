import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';


@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true, unique: true })
  dni!: string;

  @Column({ default: true })
  active!: boolean;

 
}



