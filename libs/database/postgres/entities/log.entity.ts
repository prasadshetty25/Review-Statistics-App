import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('logs')
export class Log extends BaseEntity {
  @Column({ type: 'varchar', length: 10 })
  level!: string; // info, warn, error

  @Column({ type: 'varchar', length: 50, nullable: true })
  appName?: string;

  @Column({ type: 'varchar', length: 10 })
  method!: string;

  @Column({ type: 'varchar', length: 500 })
  endpoint!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  userId?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent?: string;

  @Column({ type: 'int' })
  statusCode!: number;

  @Column({ type: 'int' })
  duration!: number; // in milliseconds

  @Column({ type: 'jsonb', nullable: true })
  requestBody?: any;

  @Column({ type: 'jsonb', nullable: true })
  responseBody?: any;

  @Column({ type: 'jsonb', nullable: true })
  headers?: any;
}
