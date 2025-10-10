import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Hotel } from './Hotel';

export enum CityStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled'
}

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn('increment')
  cityId!: number;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  cityName!: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  gps!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @Column({
    type: 'enum',
    enum: CityStatus,
    default: CityStatus.ACTIVE,
    nullable: false
  })
  status!: CityStatus;

  // Relations
  @OneToMany(() => Hotel, hotel => hotel.city)
  hotels!: Hotel[];
}
