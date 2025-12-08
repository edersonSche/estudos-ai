import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  sendToAI(@Body() body: { prompt: string }) {
    const { prompt } = body;
    if (!prompt) {
      throw new BadRequestException('Prompt required');
    }

    return this.appService.sendtoAI(body.prompt);
  }
}
