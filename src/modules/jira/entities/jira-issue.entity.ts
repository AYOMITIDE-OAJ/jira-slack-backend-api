import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class JiraIssue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  issueId: string;

  @Column('text')
  summary: string;

  @Column()
  status: string;

  @Column('timestamp')
  createdAt: Date;
}
