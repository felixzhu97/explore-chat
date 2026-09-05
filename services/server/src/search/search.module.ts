import { Module } from "@nestjs/common";
import { SearchController } from "./controller/search.controller";
import { SearchService } from "@/search/service/search.service";

@Module({
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
