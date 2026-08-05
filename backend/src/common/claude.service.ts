import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';

const moodExtractionSchema = {
  type: 'object',
  properties: {
    moodTag: {
      type: 'string',
      enum: ['stress', 'anxiety', 'sadness', 'calm', 'tired'],
    },
    intensity: {
      type: 'integer',
      description: 'An integer from 1 through 5.',
    },
    topic: {
      type: 'string',
      enum: ['work', 'relationship', 'health', 'sleep', 'other'],
    },
    summary: {
      type: 'string',
      description: 'At most 50 words and in the same language as the input.',
    },
  },
  required: ['moodTag', 'intensity', 'topic', 'summary'],
  additionalProperties: false,
} as const;

export type StructuredMoodExtraction = {
  moodTag: 'stress' | 'anxiety' | 'sadness' | 'calm' | 'tired';
  intensity: number;
  topic: 'work' | 'relationship' | 'health' | 'sleep' | 'other';
  summary: string;
};

/**
 * The team's two-model strategy (decided in the Master Spec):
 * - HAIKU: structured background tasks (mood tagging, summarization, weekly pattern aggregation)
 * - SONNET: main user chat and final meditation-text generation (requires strong emotional understanding)
 *
 * Never hardcode a model elsewhere. Always use this service so a model change only needs to be
 * made here.
 */
@Injectable()
export class ClaudeService {
  private readonly client: Anthropic;
  private readonly logger = new Logger(ClaudeService.name);

  private readonly MODEL_BACKGROUND = 'claude-haiku-4-5-20251001';
  private readonly MODEL_GENERATION = 'claude-sonnet-5';

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY')?.trim();
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY must be configured before the backend can start.');
    }
    this.client = new Anthropic({ apiKey });
  }

  /** Extract structured data from the user's free text → mood_tag, intensity, topic, summary. */
  async extractMoodStructured(rawUserText: string): Promise<StructuredMoodExtraction> {
    try {
      const response = await this.client.messages.create({
        model: this.MODEL_BACKGROUND,
        max_tokens: 300,
        system:
          'Extract structured mood data from German or English text. ' +
          'Keep the summary under 50 words and in the same language as the input.',
        messages: [{ role: 'user', content: rawUserText }],
        output_config: {
          format: {
            type: 'json_schema',
            schema: moodExtractionSchema,
          },
        },
      });

      this.assertNaturalCompletion(response.stop_reason, 'mood extraction');
      const text = this.extractText(response.content);
      if (!text.trim()) {
        throw new Error('Claude returned no mood-extraction output.');
      }

      const parsedOutput: unknown = JSON.parse(text);
      return parsedOutput as StructuredMoodExtraction;
    } catch (error) {
      this.logFailure('Mood extraction', error);
      throw error;
    }
  }

  /** Aggregate several summarized entries into a weekly behavioral pattern. */
  async summarizeWeeklyPattern(entrySummaries: string[]): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: this.MODEL_BACKGROUND,
        max_tokens: 200,
        system:
          'Summarize these mood check-in summaries from the past week into ONE short paragraph ' +
          'describing the recurring pattern (dominant mood, dominant topic, trend). ' +
          'Max 60 words. Same language as the input entries.',
        messages: [{ role: 'user', content: entrySummaries.join('\n') }],
      });
      this.assertNaturalCompletion(response.stop_reason, 'weekly mood-pattern summary');
      return this.extractText(response.content);
    } catch (error) {
      this.logFailure('Weekly mood-pattern summary', error);
      throw error;
    }
  }

  /** Generate the final personalized meditation text; this output is later sent to TTS. */
  async generatePersonalizedMeditation(params: {
    language: 'de' | 'en';
    todayCheckIn: string;
    weeklyPattern: string | null;
  }): Promise<string> {
    const { language, todayCheckIn, weeklyPattern } = params;
    try {
      const response = await this.client.messages.create({
        model: this.MODEL_GENERATION,
        max_tokens: 1800,
        thinking: { type: 'disabled' },
        system:
          `You are a calm, warm meditation guide writing in ${language === 'de' ? 'German' : 'English'}. ` +
          'Write a guided meditation script (5-8 minutes when spoken, ~700-900 words) tailored to ' +
          "the user's current state and recent pattern. Natural pacing, include pauses marked as [pause]. " +
          'Never make medical or therapeutic claims (e.g. "this cures anxiety"); use supportive, ' +
          'non-clinical language ("helps you find a moment of calm").',
        messages: [
          {
            role: 'user',
            content:
              `Today's check-in: ${todayCheckIn}\n` +
              (weeklyPattern
                ? `Recent pattern (last 7 days): ${weeklyPattern}`
                : 'No prior pattern yet (new user).'),
          },
        ],
      });
      this.assertNaturalCompletion(response.stop_reason, 'meditation generation');
      return this.extractText(response.content);
    } catch (error) {
      this.logFailure('Meditation generation', error);
      throw error;
    }
  }

  private assertNaturalCompletion(stopReason: string | null, operation: string): void {
    if (stopReason !== 'end_turn') {
      throw new Error(`Claude ${operation} stopped with reason: ${stopReason ?? 'unknown'}.`);
    }
  }

  private extractText(content: Array<{ type: string; text?: string }>): string {
    return content.map((block) => (block.type === 'text' ? (block.text ?? '') : '')).join('');
  }

  private logFailure(operation: string, error: unknown): void {
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    const status = getNumericProperty(error, 'status');
    const requestId = getStringProperty(error, 'request_id');
    const metadata = [status === null ? null : `status=${status}`, requestId ? `requestId=${requestId}` : null]
      .filter((value): value is string => value !== null)
      .join(' ');

    this.logger.error(`${operation} failed: ${errorName}${metadata ? ` (${metadata})` : ''}`);
  }
}

function getNumericProperty(value: unknown, property: string): number | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const candidate = (value as Record<string, unknown>)[property];
  return typeof candidate === 'number' ? candidate : null;
}

function getStringProperty(value: unknown, property: string): string | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const candidate = (value as Record<string, unknown>)[property];
  return typeof candidate === 'string' ? candidate : null;
}
