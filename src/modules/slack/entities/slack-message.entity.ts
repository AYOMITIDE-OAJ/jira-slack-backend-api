import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SlackMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column('text')
  message: string;

  @Column('timestamp')
  timestamp: Date;
}
