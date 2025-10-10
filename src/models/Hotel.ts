import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from './User';
import { Room } from './Room';
import { Booking } from './Booking';
import { City } from './City';

export enum HotelStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DISABLED = 'disabled'
}

@Entity('hotels')
@Index('idx_hotels_city', ['cityId'])
export class Hotel {
  @PrimaryGeneratedColumn('increment')
  hotelId!: number;

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'integer', nullable: false })
  cityId!: number;

  @Column({ type: 'uuid', nullable: true })
  owner_id!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  hotelName!: string;

  @Column({ type: 'text', nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  address!: string;

  @Column({ type: 'text', nullable: false })
  location!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({
    type: 'enum',
    enum: HotelStatus,
    default: HotelStatus.ACTIVE,
    nullable: false
  })
  status!: HotelStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  // Relations
  @ManyToOne(() => City, city => city.hotels)
  @JoinColumn({ name: 'cityId' })
  city!: City;

  @ManyToOne(() => User, user => user.hotels)
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @OneToMany(() => Room, room => room.hotel)
  rooms!: Room[];

  @OneToMany(() => Booking, booking => booking.hotel)
  bookings!: Booking[];
}