import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Movie } from '../movies/movies.entity';
import { Room } from '../rooms/rooms.entity';

@Entity()
export class FunctionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Movie)
  @JoinColumn({ name: 'movieId' })
  movie: Movie;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @Column()
  date: string; //fecha

  @Column()
  time: string;

  @Column('decimal')
  price: number;

  @Column()
  availableSeats: number; //Asientos disponibles
}



