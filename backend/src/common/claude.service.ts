import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';

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
  private client: Anthropic;

  private readonly MODEL_BACKGROUND = 'claude-haiku-4-5-20251001';
  private readonly MODEL_GENERATION = 'claude-sonnet-5';

  constructor(private config: ConfigService) {
    this.client = new Anthropic({ apiKey: this.config.get<string>('ANTHROPIC_API_KEY') });
  }

  /** Extract structured data from the user's free text → mood_tag, intensity, topic, summary. */
  async extractMoodStructured(rawUserText: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.MODEL_BACKGROUND,
      max_tokens: 300,
      system:
        'You extract structured mood data from German or English free text. ' +
        'Respond ONLY with valid JSON, no preamble, no markdown fences. ' +
        'Schema: {"moodTag": "stress|anxiety|sadness|calm|tired", "intensity": 1-5, ' +
        '"topic": "work|relationship|health|sleep|other", "summary": "max 50 words, same language as input"}',
      messages: [{ role: 'user', content: rawUserText }],
    });
    return response.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('');
  }

  /** Aggregate several summarized entries into a weekly behavioral pattern. */
  async summarizeWeeklyPattern(entrySummaries: string[]): Promise<string> {
    const response = await this.client.messages.create({
      model: this.MODEL_BACKGROUND,
      max_tokens: 200,
      system:
        'Summarize these mood check-in summaries from the past week into ONE short paragraph ' +
        'describing the recurring pattern (dominant mood, dominant topic, trend). ' +
        'Max 60 words. Same language as the input entries.',
      messages: [{ role: 'user', content: entrySummaries.join('\n') }],
    });
    return response.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
  }

  /** Generate the final personalized meditation text; this output is later sent to TTS. */
  async generatePersonalizedMeditation(params: {
    language: 'de' | 'en';
    todayCheckIn: string;
    weeklyPattern: string | null;
  }): Promise<string> {
    const { language, todayCheckIn, weeklyPattern } = params;
    const response = await this.client.messages.create({
      model: this.MODEL_GENERATION,
      max_tokens: 1200,
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
            (weeklyPattern ? `Recent pattern (last 7 days): ${weeklyPattern}` : 'No prior pattern yet (new user).'),
        },
      ],
    });
    return response.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
  }
}
