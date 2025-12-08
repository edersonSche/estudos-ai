import { GoogleGenAI } from '@google/genai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const PRICE_INPUT = 0.1 / 1_000_000;
const PRICE_OUTPUT = 0.1 / 1_000_000;

@Injectable()
export class GeminiService {
  private readonly gemini: GoogleGenAI;
  private readonly logger: Logger;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger();

    this.gemini = new GoogleGenAI({
      apiKey: this.configService.get<string>('GEMINI_API_KEY') ?? '',
    });
  }

  async call(prompt: string, temperature: number = 0.2, retries: number = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.gemini.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { temperature },
        });

        const inputTokens = response.usageMetadata?.promptTokenCount ?? 0;
        const outputTokens = response.usageMetadata?.thoughtsTokenCount ?? 0;

        const cost = inputTokens * PRICE_INPUT + outputTokens * PRICE_OUTPUT;

        return {
          text: response.text,
          usage: response.usageMetadata ?? null,
          cost,
        };
      } catch (err: any) {
        if (attempt === retries) {
          this.logger.error(`Error after retries: ${err.message}`);
          throw err;
        }

        this.logger.warn(`Retry (${attempt + 1}/${retries})...`);
        await new Promise((res) => setTimeout(res, 500 * (attempt + 1))); // backoff simples
      }
    }
  }
}
