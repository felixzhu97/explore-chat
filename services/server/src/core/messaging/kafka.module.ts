import { Global, Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { VisionModule } from "@/ai/vision.module";
import { KafkaProducerService } from "./kafka-producer.service";
import { KafkaConsumerService } from "./kafka-consumer.service";

@Global()
@Module({
  imports: [DatabaseModule, VisionModule],
  providers: [KafkaProducerService, KafkaConsumerService],
  exports: [KafkaProducerService],
})
export class KafkaModule {}
