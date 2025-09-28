import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn, Index, Generated } from 'typeorm';
import { User } from './User';
import { Hotel } from './Hotel';
import { Room } from './Room';
import { Payment } from './Payment';
import { PaymentLog } from './PaymentLog';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  REFUNDED = 'refunded'
}

@Entity('bookings')
@Index('idx_bookings_user', ['user_id'])
@Index('idx_bookings_hotel', ['hotel_id'])
@Index('idx_bookings_room', ['room_id'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  user_id!: string;

  @Column({ type: 'uuid', nullable: false })
  hotel_id!: string;

  @Column({ type: 'uuid', nullable: false })
  room_id!: string;

  @Column({ type: 'date', nullable: false })
  checkin_date!: Date;

  @Column({ type: 'date', nullable: false })
  checkout_date!: Date;

  @Column({ type: 'int', nullable: false })
  nights!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false })
  total_amount!: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
    nullable: false
  })
  status!: BookingStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  // Relations
  @ManyToOne(() => User, user => user.bookings)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Hotel, hotel => hotel.bookings)
  @JoinColumn({ name: 'hotel_id' })
  hotel!: Hotel;

  @ManyToOne(() => Room, room => room.bookings)
  @JoinColumn({ name: 'room_id' })
  room!: Room;

  @OneToMany(() => Payment, payment => payment.booking)
  payments!: Payment[];

  @OneToMany(() => PaymentLog, paymentLog => paymentLog.booking)
  payment_logs!: PaymentLog[];
}