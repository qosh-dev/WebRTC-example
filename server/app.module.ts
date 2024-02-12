import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MessageGateway } from './gateways/message.gateway';

@Module({
  controllers: [AppController],
  providers: [MessageGateway]
})
export class AppModule {}
