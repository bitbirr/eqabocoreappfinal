import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Hotel } from './Hotel';
import { Booking } from './Booking';

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  OUT_OF_ORDER = 'out_of_order'
}

@Entity('rooms')
@Index('idx_rooms_hotel', ['hotel_id'])
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  hotel_id!: string;

  @Column({ type: 'text', nullable: false })
  room_number!: string;

  @Column({ type: 'text', nullable: false })
  room_type!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price_per_night!: number;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.AVAILABLE,
    nullable: false
  })
  status!: RoomStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  // Relations
  @ManyToOne(() => Hotel, hotel => hotel.rooms)
  @JoinColumn({ name: 'hotel_id' })
  hotel!: Hotel;

  @OneToMany(() => Booking, booking => booking.room)
  bookings!: Booking[];
}