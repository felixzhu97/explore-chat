import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from '@/application/services/ai.service';

@Module({
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
