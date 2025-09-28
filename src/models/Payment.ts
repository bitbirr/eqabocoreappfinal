import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Booking } from './Booking';
import { PaymentLog } from './PaymentLog';

export enum PaymentProvider {
  CHAPPA = 'chappa',
  TELEBIRR = 'telebirr',
  EBIRR = 'ebirr',
  KAAFI = 'kaafi'
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed'
}

@Entity('payments')
@Index('idx_payments_booking', ['booking_id'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  booking_id!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false })
  amount!: number;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
    nullable: false
  })
  provider!: PaymentProvider;

  @Column({ type: 'text', nullable: true })
  provider_reference!: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
    nullable: false
  })
  status!: PaymentStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  // Relations
  @ManyToOne(() => Booking, booking => booking.payments)
  @JoinColumn({ name: 'booking_id' })
  booking!: Booking;

  @OneToMany(() => PaymentLog, paymentLog => paymentLog.payment)
  payment_logs!: PaymentLog[];
}