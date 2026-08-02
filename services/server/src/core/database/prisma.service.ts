import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import logger from "@/shared/utils/logger";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log:
        process.env["NODE_ENV"] === "development"
          ? ["query", "info", "warn", "error"]
          : ["error"],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      logger.info("✅ Database connected successfully");
    } catch (error) {
      const nodeEnv = process.env["NODE_ENV"] || "development";
      const isProduction = nodeEnv === "production";

      if (isProduction) {
        logger.error("❌ Database connection failed:", error);
        throw error;
      } else {
        logger.warn(
          "⚠️  Database connection failed (Development mode, application will continue to start):",
        );
        logger.warn(`   Please ensure PostgreSQL service is running`);
        logger.warn(
          `   Connection string: ${process.env["DATABASE_URL"] || "Not set"}`,
        );
        // In development environment, don't throw error, allow application to start
        // But will fail when actually using the database
      }
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      logger.info("✅ Database disconnected successfully");
    } catch (error) {
      logger.error("❌ Database disconnection failed:", error);
    }
  }
}
