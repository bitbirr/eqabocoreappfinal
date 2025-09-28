import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Booking } from './Booking';
import { Payment } from './Payment';

@Entity('payment_logs')
@Index('idx_payment_logs_payment', ['payment_id'])
@Index('idx_payment_logs_booking', ['booking_id'])
export class PaymentLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  payment_id!: string;

  @Column({ type: 'uuid', nullable: false })
  booking_id!: string;

  @Column({ type: 'text', nullable: false })
  action!: string;

  @Column({ type: 'text', nullable: true })
  details!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  // Relations
  @ManyToOne(() => Payment, payment => payment.payment_logs)
  @JoinColumn({ name: 'payment_id' })
  payment!: Payment;

  @ManyToOne(() => Booking, booking => booking.payment_logs)
  @JoinColumn({ name: 'booking_id' })
  booking!: Booking;
}