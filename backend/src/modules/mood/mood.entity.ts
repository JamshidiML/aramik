import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

export enum MoodTag {
  STRESS = 'stress',
  ANXIETY = 'anxiety',
  SADNESS = 'sadness',
  CALM = 'calm',
  TIRED = 'tired',
}

export enum MoodTopic {
  WORK = 'work',
  RELATIONSHIP = 'relationship',
  HEALTH = 'health',
  SLEEP = 'sleep',
  OTHER = 'other',
}

/**
 * جدول اصلی حافظه بلندمدت. هر چک‌این کاربر یک ردیف اینجا ذخیره می‌شود.
 * حساس: طبق GDPR Art. 9 (داده سلامت). باید encryption at rest فعال باشد
 * (تنظیمات دیتابیس، نه در سطح اپلیکیشن - در docs/GDPR_NOTES.md توضیح داده شده).
 */
@Entity('mood_entries')
export class MoodEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string; // FK به جدول users

  @Column({ type: 'enum', enum: MoodTag })
  moodTag: MoodTag; // خروجی Claude Haiku از متن آزاد کاربر

  @Column({ type: 'int' })
  intensity: number; // ۱ تا ۵

  @Column({ type: 'enum', enum: MoodTopic, nullable: true })
  topic: MoodTopic | null;

  @Column({ type: 'text', nullable: true })
  rawUserText: string | null; // متن اصلی کاربر (اختیاری، کاربر می‌تواند حذفش کند)

  @Column({ type: 'varchar', length: 300, nullable: true })
  aiSummary: string | null; // خلاصه ≤۵۰ کلمه تولیدشده توسط Haiku

  @CreateDateColumn()
  createdAt: Date;
}
