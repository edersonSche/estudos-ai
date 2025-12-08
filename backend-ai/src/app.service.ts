import { Injectable } from '@nestjs/common';
import { GeminiService } from './providers/gemini.service';

@Injectable()
export class AppService {
  constructor(private readonly geminiService: GeminiService) {}

  async sendtoAI(prompt: string) {
    return await this.geminiService.call(prompt);
  }
}
