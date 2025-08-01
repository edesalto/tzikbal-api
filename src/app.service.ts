import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHello() {
    return { message: 'API Running!' };
  }

  getVersion() {
    const version: string = this.configService.get<string>('VERSION') ?? '';
    return { version };
  }
}
