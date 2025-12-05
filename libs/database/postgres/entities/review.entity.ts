import { Entity, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('reviews')
export class Review extends BaseEntity {
  @Column({ type: 'int', name: 'user_id', unique: true })
  @Index()
  userId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user?: User;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text' })
  comment: string;
}
