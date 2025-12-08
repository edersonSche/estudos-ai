import { GoogleGenAI } from '@google/genai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

        //console.log(response.text);

        return {
          text: response.text,
          usage: response.usageMetadata ?? null,
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
