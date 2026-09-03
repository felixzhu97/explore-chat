import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import compression from "compression";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "@/core/filters/all-exceptions.filter";
import { HttpExceptionFilter } from "@/core/filters/http-exception.filter";
import { ValidationExceptionFilter } from "@/core/filters/validation-exception.filter";
import { LoggingInterceptor } from "@/core/interceptors/logging.interceptor";
import { TransformInterceptor } from "@/core/interceptors/transform.interceptor";
import logger from "@/shared/utils/logger";
import path from "path";
import { ConfigService } from "@/core/config/config.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const express = await import("express");
  const bodyLimit = "10mb";
  const config = ConfigService.loadConfig();
  app.use(express.json({ limit: bodyLimit }));
  app.use(express.urlencoded({ extended: true, limit: bodyLimit }));
  app.use(
    "/uploads/media",
    express.static(path.resolve(process.cwd(), config.storage.local.uploadDir)),
  );

  // 全局前缀
  app.setGlobalPrefix("api/v1");

  // 安全中间件
  app.use(helmet());
  app.use(compression());

  // CORS配置
  const corsOptions = {
    origin: process.env["CORS_ORIGIN"]?.split(",") || [
      "http://localhost:4220",
      "http://localhost:4001",
    ],
    credentials: true,
  };
  app.enableCors(corsOptions);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 全局拦截器
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // 全局异常过滤器
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(),
    new ValidationExceptionFilter(),
  );

  // Swagger文档配置
  if (process.env["NODE_ENV"] !== "production") {
    const config = new DocumentBuilder()
      .setTitle("WhatsChat API")
      .setDescription("WhatsChat即时通讯应用API文档")
      .setVersion("1.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);
  }

  const port = parseInt(process.env["PORT"] || "9200", 10);
  const host = process.env["HOST"] || "0.0.0.0";

  await app.listen(port, host);

  logger.info(`🚀 WhatsChat服务器启动成功 (body limit: 10mb)`);
  logger.info(
    `📍 监听: ${host}:${port} (本机: http://localhost:${port}, 局域网: http://<本机IP>:${port})`,
  );
  if (host === "0.0.0.0") {
    logger.info(`📍 真机访问请用本机局域网 IP，并确保防火墙放行 ${port} 端口`);
  }
  logger.info(`🌍 环境: ${process.env["NODE_ENV"] || "development"}`);
  if (process.env["NODE_ENV"] !== "production") {
    logger.info(`📚 API文档: http://localhost:${port}/api/docs`);
  }
}

bootstrap().catch((error) => {
  logger.error("应用启动失败:", error);
  process.exit(1);
});
