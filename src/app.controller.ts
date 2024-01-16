import { Body, Controller, Get, HttpException, HttpStatus, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/reply')
  async chatReply(@Body() body) {
    try {
      return await this.appService.getUserReply(body.chat, body.contact?.phone);
    } catch (err) {
      console.error(err.message)
      throw new HttpException(`error on user reply ${err.message}`, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
