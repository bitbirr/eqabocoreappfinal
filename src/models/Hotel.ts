import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { Room } from './Room';
import { Booking } from './Booking';

export enum HotelStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

@Entity('hotels')
export class Hotel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  owner_id!: string;

  @Column({ type: 'text', nullable: false })
  name!: string;

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

  // Relations
  @ManyToOne(() => User, user => user.hotels)
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @OneToMany(() => Room, room => room.hotel)
  rooms!: Room[];

  @OneToMany(() => Booking, booking => booking.hotel)
  bookings!: Booking[];
}