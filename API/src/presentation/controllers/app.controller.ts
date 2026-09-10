import { Controller, Get } from '@nestjs/common';
import { AppService } from '../../application/services/app.service';
import { Public } from '../auth/auth.decorators';

@Public()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
