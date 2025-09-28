import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Hotel } from './Hotel';
import { Booking } from './Booking';

export enum UserRole {
  CUSTOMER = 'customer',
  HOTEL_OWNER = 'hotel_owner',
  ADMIN = 'admin'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  first_name!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  last_name!: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email!: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  phone!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password_hash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
    nullable: false
  })
  role!: UserRole;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  // Relations
  @OneToMany(() => Hotel, hotel => hotel.owner)
  hotels!: Hotel[];

  @OneToMany(() => Booking, booking => booking.user)
  bookings!: Booking[];
}