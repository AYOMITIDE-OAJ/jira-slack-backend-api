import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SlackMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column()
  user: string;

  @Column()
  text: string;

  @Column()
  ts: string;

  @Column({ nullable: true })
  channel: string;
}
