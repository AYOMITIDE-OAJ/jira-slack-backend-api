/* eslint-disable @typescript-eslint/no-unused-vars */
import { Entity, Column, PrimaryColumn } from 'typeorm';

class Status {
  @Column()
  name: string;
}

class Assignee {
  @Column()
  displayName: string;

  @Column({ nullable: true })
  emailAddress: string;
}

class Priority {
  @Column()
  name: string;
}

@Entity()
export class JiraIssue {
  @PrimaryColumn()
  id: string;

  @Column()
  created: Date;

  @Column()
  updated: Date;

  @Column((type) => Status)
  status: Status;

  @Column((type) => Assignee)
  assignee: Assignee;

  @Column((type) => Priority)
  priority: Priority;

  @Column()
  summary: string;
}
