import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('reviews')
export class Review extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  userId: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text' })
  comment: string;
}
