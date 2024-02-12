import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import register from '@react-ssr/nestjs-express/register';
import redisIoAdapter from 'socket.io-redis';
import { AppModule } from './app.module';

export class RedisIoAdapter extends IoAdapter {
  createIOServer(port: number): any {
    const server = super.createIOServer(port);
    const redisAdapter = redisIoAdapter({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      auth_pass: process.env.REDIS_PASSWORD
    });

    redisAdapter.prototype.on('error', function (err) {
      console.error('adapter error: ', err);
    });

    server.adapter(redisAdapter);
    return server;
  }
}

(async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  await register(app);

  app.setViewEngine('hbs');

  app.useWebSocketAdapter(new RedisIoAdapter(app));

  const PORT = 4002;

  app.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
})();
