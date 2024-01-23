import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { logToSlack } from './slack.log';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/reply')
  async chatReply(@Body() body) {
    console.log('body', body);
    logToSlack(`request receieved with body: ${JSON.stringify(body, null, 2)}`);
    this.appService.getUserReply(body.chat, body.contact?.id).catch((err) => {
      console.error(err.message);
      logToSlack(err.message);
      throw new HttpException(
        `error on user reply ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    return 'OK';
  }
}
