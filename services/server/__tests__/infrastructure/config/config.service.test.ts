import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConfigService } from "@/core/config/config.service";

describe("ConfigService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loadConfig", () => {
    it("should return configuration with all required sections", () => {
      const config = ConfigService.loadConfig();

      expect(config).toBeDefined();
      expect(config.server).toBeDefined();
      expect(config.database).toBeDefined();
      expect(config.redis).toBeDefined();
      expect(config.kafka).toBeDefined();
      expect(config.jwt).toBeDefined();
      expect(config.storage).toBeDefined();
      expect(config.cassandra).toBeDefined();
      expect(config.mongodb).toBeDefined();
      expect(config.elasticsearch).toBeDefined();
    });

    it("should have server configuration with required properties", () => {
      const config = ConfigService.loadConfig();

      expect(config.server.port).toBeDefined();
      expect(config.server.host).toBeDefined();
      expect(config.server.nodeEnv).toBeDefined();
      expect(config.server.isProduction).toBeDefined();
      expect(config.server.isDevelopment).toBeDefined();
    });

    it("should have database configuration", () => {
      const config = ConfigService.loadConfig();

      expect(config.database.url).toBeDefined();
    });

    it("should have redis configuration", () => {
      const config = ConfigService.loadConfig();

      expect(config.redis.url).toBeDefined();
      expect(config.redis.cacheTtlSeconds).toBeDefined();
    });

    it("should have kafka configuration with topics", () => {
      const config = ConfigService.loadConfig();

      expect(Array.isArray(config.kafka.brokers)).toBe(true);
      expect(config.kafka.topicOfflineMessages).toBeDefined();
      expect(config.kafka.topicPostCreated).toBeDefined();
      expect(config.kafka.topicPostDeleted).toBeDefined();
      expect(config.kafka.topicFeedFanout).toBeDefined();
      expect(config.kafka.topicCommentCreated).toBeDefined();
      expect(config.kafka.topicAnalyticsEvents).toBeDefined();
    });

    it("should have jwt configuration", () => {
      const config = ConfigService.loadConfig();

      expect(config.jwt.secret).toBeDefined();
      expect(config.jwt.expiresIn).toBeDefined();
      expect(config.jwt.refreshSecret).toBeDefined();
      expect(config.jwt.refreshExpiresIn).toBeDefined();
    });

    it("should have cassandra configuration", () => {
      const config = ConfigService.loadConfig();

      expect(Array.isArray(config.cassandra.contactPoints)).toBe(true);
      expect(config.cassandra.keyspace).toBeDefined();
      expect(config.cassandra.localDatacenter).toBeDefined();
    });

    it("should have mongodb configuration", () => {
      const config = ConfigService.loadConfig();

      expect(config.mongodb.uri).toBeDefined();
    });

    it("should have elasticsearch configuration", () => {
      const config = ConfigService.loadConfig();

      expect(config.elasticsearch.node).toBeDefined();
    });

    it("should have storage configuration", () => {
      const config = ConfigService.loadConfig();

      expect(config.storage.local).toBeDefined();
      expect(config.storage.minio).toBeDefined();
      expect(config.storage.local.uploadDir).toBeDefined();
      expect(config.storage.local.maxFileSize).toBeDefined();
      expect(Array.isArray(config.storage.local.allowedMimeTypes)).toBe(true);
    });

    it("should have webrtc configuration", () => {
      const config = ConfigService.loadConfig();

      expect(Array.isArray(config.webrtc.stunServers)).toBe(true);
      expect(Array.isArray(config.webrtc.turnServers)).toBe(true);
    });

    it("should have security configuration", () => {
      const config = ConfigService.loadConfig();

      expect(config.security.cors).toBeDefined();
      expect(Array.isArray(config.security.cors.origin)).toBe(true);
      expect(config.security.rateLimit).toBeDefined();
      expect(config.security.rateLimit.windowMs).toBeDefined();
      expect(config.security.rateLimit.max).toBeDefined();
      expect(config.security.bcrypt).toBeDefined();
      expect(config.security.bcrypt.saltRounds).toBeDefined();
    });

    it("should have monitoring configuration", () => {
      const config = ConfigService.loadConfig();

      expect(config.monitoring.sentry).toBeDefined();
      expect(config.monitoring.prometheus).toBeDefined();
    });

    it("should have business configuration", () => {
      const config = ConfigService.loadConfig();

      expect(config.business.maxGroupParticipants).toBeDefined();
      expect(config.business.maxMessageLength).toBeDefined();
      expect(config.business.maxFileSize).toBeDefined();
    });

    it("should have vision configuration", () => {
      const config = ConfigService.loadConfig();

      expect(config.vision.enabled).toBeDefined();
      expect(config.vision.serviceUrl).toBeDefined();
      expect(config.vision.timeoutMs).toBeDefined();
      expect(config.vision.maxImagesPerPost).toBeDefined();
      expect(config.vision.moderationEnabled).toBeDefined();
    });

    it("should have ai configuration", () => {
      const config = ConfigService.loadConfig();

      expect(config.ai.ollamaBaseUrl).toBeDefined();
      expect(config.ai.defaultModel).toBeDefined();
    });
  });

  describe("validateConfig", () => {
    it("should return config as AppConfig type", () => {
      const config = ConfigService.loadConfig();
      const validated = ConfigService.validateConfig(config);

      expect(validated).toBe(config);
    });
  });

  describe("getConfig", () => {
    it("should return the loaded configuration", () => {
      const service = new ConfigService();
      const config = service.getConfig();

      expect(config).toBeDefined();
      expect(config.server).toBeDefined();
    });
  });
});
