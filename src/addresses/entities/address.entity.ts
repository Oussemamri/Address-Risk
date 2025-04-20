import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column({ nullable: true })
  housenumber: string;

  @Column()
  street: string;

  @Column()
  postcode: string;

  @Column()
  citycode: string;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;
}