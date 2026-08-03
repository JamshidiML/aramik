import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('meditations')
export class Meditation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column({ type: 'text' })
  script!: string;

  @Column({ type: 'varchar', length: 2 })
  language!: 'de' | 'en';

  @CreateDateColumn()
  generatedAt!: Date;
}
