import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index, Generated } from 'typeorm';
import { Hotel } from './Hotel';
import { Booking } from './Booking';

export enum RoomType {
  SINGLE = 'single',
  DOUBLE = 'double',
  SUITE = 'suite'
}

export enum RoomStatus {
  AVAILABLE = 'Available',
  RESERVED = 'Reserved',
  // Legacy statuses for backward compatibility
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  OUT_OF_ORDER = 'out_of_order'
}

@Entity('rooms')
@Index('idx_rooms_hotel', ['hotelId'])
export class Room {
  @Column({ type: 'integer', nullable: true })
  @Generated('increment')
  roomId!: number;

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'integer', nullable: false })
  hotelId!: number;

  @Column({ type: 'uuid', nullable: false })
  hotel_id!: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  roomNumber!: string;

  @Column({ type: 'text', nullable: false })
  room_number!: string;

  @Column({ 
    type: 'enum',
    enum: RoomType,
    nullable: false 
  })
  roomType!: RoomType;

  @Column({ type: 'text', nullable: false })
  room_type!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price!: number;

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

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Hotel, hotel => hotel.rooms)
  @JoinColumn({ name: 'hotelId', referencedColumnName: 'hotelId' })
  hotel!: Hotel;

  @OneToMany(() => Booking, booking => booking.room)
  bookings!: Booking[];
}