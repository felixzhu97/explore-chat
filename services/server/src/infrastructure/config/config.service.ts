import { Injectable } from "@nestjs/common";

export interface AppConfig {
  server: {
    port: number;
    host: string;
    nodeEnv: string;
    isProduction: boolean;
    isDevelopment: boolean;
  };
  database: {
    url: string;
  };
  redis: {
    url: string;
    password?: string;
    cacheTtlSeconds: number;
  };
  kafka: {
    brokers: string[];
    topicOfflineMessages: string;
    topicPostCreated: string;
    topicPostDeleted: string;
    topicFeedFanout: string;
    topicCommentCreated: string;
    topicAnalyticsEvents: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  storage: {
    local: {
      uploadDir: string;
      maxFileSize: number;
      allowedMimeTypes: string[];
    };
    minio: {
      endpoint: string;
      port: number;
      useSsl: boolean;
      accessKey: string;
      secretKey: string;
      bucket: string;
      region: string;
      publicBaseUrl: string;
    };
  };
  email: {
    host: string;
    port: number;
    user?: string;
    pass?: string;
    from: string;
  };
  cassandra: {
    contactPoints: string[];
    keyspace: string;
    localDatacenter: string;
  };
  mongodb: {
    uri: string;
  };
  elasticsearch: {
    node: string;
    username?: string;
    password?: string;
  };
  push: {
    fcm: {
      serverKey?: string;
    };
    apn: {
      keyId?: string;
      teamId?: string;
      bundleId: string;
    };
  };
  webrtc: {
    stunServers: string[];
    turnServers: string[];
    turnUsername?: string;
    turnCredential?: string;
  };
  logging: {
    level: string;
    filePath: string;
    maxSize: string;
    maxFiles: string;
  };
  security: {
    cors: {
      origin: string[];
      credentials: boolean;
    };
    rateLimit: {
      windowMs: number;
      max: number;
    };
    bcrypt: {
      saltRounds: number;
    };
  };
  monitoring: {
    sentry: {
      dsn?: string;
    };
    prometheus: {
      port: number;
    };
  };
  admin: {
    emails: string[];
  };
  ai: {
    ollamaBaseUrl: string;
    defaultModel: string;
  };
  video: {
    replicateApiToken?: string;
    videoApiBaseUrl?: string;
  };
  image: {
    replicateApiToken?: string;
    imageApiBaseUrl?: string;
  };
  voice: {
    voiceApiBaseUrl?: string;
  };
  business: {
    maxGroupParticipants: number;
    maxMessageLength: number;
    maxStatusDuration: number;
    maxFileSize: number;
    messageRetentionDays: number;
    statusRetentionHours: number;
  };
  recommendation: {
    apiBaseUrl: string;
  };
  vision: {
    enabled: boolean;
    serviceUrl: string;
    timeoutMs: number;
    maxImagesPerPost: number;
    moderationEnabled: boolean;
  };
}

@Injectable()
export class ConfigService {
  private static config: AppConfig;

  static loadConfig(): AppConfig {
    if (this.config) {
      return this.config;
    }

    const config: AppConfig = {
      server: {
        port: parseInt(process.env["PORT"] || "3001", 10),
        host: process.env["HOST"] || "0.0.0.0",
        nodeEnv: process.env["NODE_ENV"] || "development",
        isProduction: process.env["NODE_ENV"] === "production",
        isDevelopment: process.env["NODE_ENV"] !== "production",
      },
      database: {
        url:
          process.env["DATABASE_URL"] ||
          "postgresql://whatschat:whatschat123@localhost:5433/whatschat?schema=public",
      },
      redis: {
        url: process.env["REDIS_URL"] || "redis://localhost:6379",
        cacheTtlSeconds: parseInt(process.env["REDIS_CACHE_TTL"] || "300", 10),
        ...(process.env["REDIS_PASSWORD"] && {
          password: process.env["REDIS_PASSWORD"],
        }),
      },
      kafka: {
        // Set KAFKA_BROKERS= (empty) to disable Kafka and avoid connection errors in dev
        brokers: (() => {
          const raw = process.env["KAFKA_BROKERS"];
          if (raw === undefined || raw === null) return ["localhost:9092"];
          if (!raw.trim()) return [];
          return raw.split(",").map((s) => s.trim()).filter(Boolean);
        })(),
        topicOfflineMessages:
          process.env["KAFKA_TOPIC_OFFLINE_MESSAGES"] || "offline-messages",
        topicPostCreated: process.env["KAFKA_TOPIC_POST_CREATED"] || "post.created",
        topicPostDeleted: process.env["KAFKA_TOPIC_POST_DELETED"] || "post.deleted",
        topicFeedFanout: process.env["KAFKA_TOPIC_FEED_FANOUT"] || "feed.fanout",
        topicCommentCreated: process.env["KAFKA_TOPIC_COMMENT_CREATED"] || "comment.created",
        topicAnalyticsEvents: process.env["KAFKA_TOPIC_ANALYTICS_EVENTS"] || "analytics.events",
      },
      jwt: {
        secret: process.env["JWT_SECRET"] || "your-super-secret-jwt-key-here",
        expiresIn: process.env["JWT_EXPIRES_IN"] || "7d",
        refreshSecret:
          process.env["JWT_REFRESH_SECRET"] ||
          "your-super-secret-refresh-key-here",
        refreshExpiresIn: process.env["JWT_REFRESH_EXPIRES_IN"] || "30d",
      },
      storage: {
        local: {
          uploadDir: process.env["UPLOAD_DIR"] || "./uploads",
          maxFileSize: 50 * 1024 * 1024, // 50MB
          allowedMimeTypes: [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/heic",
            "image/heif",
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "audio/mpeg",
            "audio/wav",
            "audio/ogg",
            "application/pdf",
            "text/plain",
          ],
        },
        minio: {
          endpoint: process.env["MINIO_ENDPOINT"] || "localhost",
          port: parseInt(process.env["MINIO_PORT"] || "9000", 10),
          useSsl: process.env["MINIO_USE_SSL"] === "true",
          accessKey: process.env["MINIO_ACCESS_KEY"] || "minioadmin",
          secretKey: process.env["MINIO_SECRET_KEY"] || "minioadmin",
          bucket: process.env["MINIO_BUCKET"] || "whatschat-media",
          region: process.env["MINIO_REGION"] || "us-east-1",
          publicBaseUrl:
            process.env["MINIO_PUBLIC_BASE_URL"] ||
            "http://localhost:3001/uploads/media",
        },
      },
      email: {
        host: process.env["SMTP_HOST"] || "smtp.gmail.com",
        port: parseInt(process.env["SMTP_PORT"] || "587", 10),
        ...(process.env["SMTP_USER"] && { user: process.env["SMTP_USER"] }),
        ...(process.env["SMTP_PASS"] && { pass: process.env["SMTP_PASS"] }),
        from: process.env["SMTP_FROM"] || "noreply@whatschat.com",
      },
      cassandra: {
        contactPoints: (process.env["CASSANDRA_CONTACT_POINTS"] ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        keyspace: process.env["CASSANDRA_KEYSPACE"] || "whatschat",
        localDatacenter: process.env["CASSANDRA_LOCAL_DC"] || "datacenter1",
      },
      mongodb: {
        uri: process.env["MONGODB_URI"] ?? "",
      },
      elasticsearch: {
        node: process.env["ELASTICSEARCH_NODE"] ?? "",
        ...(process.env["ELASTICSEARCH_USERNAME"] && {
          username: process.env["ELASTICSEARCH_USERNAME"],
        }),
        ...(process.env["ELASTICSEARCH_PASSWORD"] && {
          password: process.env["ELASTICSEARCH_PASSWORD"],
        }),
      },
      push: {
        fcm: {
          ...(process.env["FCM_SERVER_KEY"] && {
            serverKey: process.env["FCM_SERVER_KEY"],
          }),
        },
        apn: {
          ...(process.env["APN_KEY_ID"] && {
            keyId: process.env["APN_KEY_ID"],
          }),
          ...(process.env["APN_TEAM_ID"] && {
            teamId: process.env["APN_TEAM_ID"],
          }),
          bundleId: process.env["APN_BUNDLE_ID"] || "com.whatschat.app",
        },
      },
      webrtc: {
        stunServers: process.env["WEBRTC_STUN_SERVERS"]?.split(",") || [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
        ],
        turnServers: process.env["WEBRTC_TURN_SERVERS"]?.split(",") || [],
        ...(process.env["WEBRTC_TURN_USERNAME"] && {
          turnUsername: process.env["WEBRTC_TURN_USERNAME"],
        }),
        ...(process.env["WEBRTC_TURN_CREDENTIAL"] && {
          turnCredential: process.env["WEBRTC_TURN_CREDENTIAL"],
        }),
      },
      logging: {
        level: process.env["LOG_LEVEL"] || "info",
        filePath: process.env["LOG_FILE_PATH"] || "logs/app.log",
        maxSize: "20m",
        maxFiles: "14d",
      },
      security: {
        cors: {
          origin: process.env["CORS_ORIGIN"]?.split(",") || [
            "http://localhost:4000",
            "http://localhost:4001",
          ],
          credentials: true,
        },
        rateLimit: {
          windowMs: parseInt(
            process.env["RATE_LIMIT_WINDOW_MS"] || "900000",
            10
          ), // 15 minutes
          max: parseInt(process.env["RATE_LIMIT_MAX_REQUESTS"] || "100", 10),
        },
        bcrypt: {
          saltRounds: 12,
        },
      },
      monitoring: {
        sentry: {
          ...(process.env["SENTRY_DSN"] && { dsn: process.env["SENTRY_DSN"] }),
        },
        prometheus: {
          port: parseInt(process.env["PROMETHEUS_PORT"] || "9090", 10),
        },
      },
      admin: {
        emails: (process.env["ADMIN_EMAILS"] || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      },
      ai: {
        ollamaBaseUrl: process.env["OLLAMA_BASE_URL"] || "http://localhost:11434",
        defaultModel:
          process.env["OLLAMA_DEFAULT_MODEL"] || "qwen3-coder:30b",
      },
      video: {
        ...(process.env["REPLICATE_API_TOKEN"] && {
          replicateApiToken: process.env["REPLICATE_API_TOKEN"],
        }),
        ...(process.env["MEDIA_GENERATION_API_URL"]
          ? { videoApiBaseUrl: process.env["MEDIA_GENERATION_API_URL"].replace(/\/$/, "") + "/video" }
          : process.env["VIDEO_GENERATION_API_URL"] && {
              videoApiBaseUrl: process.env["VIDEO_GENERATION_API_URL"],
            }),
      },
      image: {
        ...(process.env["REPLICATE_API_TOKEN"] && {
          replicateApiToken: process.env["REPLICATE_API_TOKEN"],
        }),
        ...(process.env["MEDIA_GENERATION_API_URL"]
          ? { imageApiBaseUrl: process.env["MEDIA_GENERATION_API_URL"].replace(/\/$/, "") + "/image" }
          : process.env["IMAGE_GENERATION_API_URL"] && {
              imageApiBaseUrl: process.env["IMAGE_GENERATION_API_URL"],
            }),
      },
      voice: {
        ...(process.env["MEDIA_GENERATION_API_URL"]
          ? { voiceApiBaseUrl: process.env["MEDIA_GENERATION_API_URL"].replace(/\/$/, "") + "/voice" }
          : process.env["VOICE_GENERATION_API_URL"] && {
              voiceApiBaseUrl: process.env["VOICE_GENERATION_API_URL"],
            }),
      },
      business: {
        maxGroupParticipants: 256,
        maxMessageLength: 4096,
        maxStatusDuration: 24 * 60 * 60 * 1000, // 24 hours
        maxFileSize: 50 * 1024 * 1024, // 50MB
        messageRetentionDays: 365,
        statusRetentionHours: 24,
      },
      recommendation: {
        apiBaseUrl: process.env["RECOMMENDATION_API_URL"] || "http://localhost:8000",
      },
      vision: {
        enabled: process.env["VISION_ENABLED"] !== "false",
        serviceUrl: (process.env["VISION_SERVICE_URL"] || "http://localhost:8001").replace(/\/$/, ""),
        timeoutMs: parseInt(process.env["VISION_TIMEOUT_MS"] || "15000", 10),
        maxImagesPerPost: parseInt(process.env["VISION_MAX_IMAGES_PER_POST"] || "3", 10),
        moderationEnabled: process.env["VISION_MODERATION_ENABLED"] !== "false",
      },
    };

    this.config = config;
    return config;
  }

  static validateConfig(config: any): AppConfig {
    const nodeEnv = process.env["NODE_ENV"] || "development";
    const isProduction = nodeEnv === "production";

    // Strict validation in production environment
    if (isProduction) {
      const requiredConfigs = [
        {
          key: "JWT_SECRET",
          value: config.jwt?.secret,
          validator: (val: string) => val && val.length >= 32,
          message: "JWT_SECRET must be at least 32 characters long",
        },
        {
          key: "DATABASE_URL",
          value: config.database?.url,
          validator: (val: string) => val && val.startsWith("postgresql://"),
          message: "DATABASE_URL must be a valid PostgreSQL connection string",
        },
        {
          key: "REDIS_URL",
          value: config.redis?.url,
          validator: (val: string) =>
            val && (val.startsWith("redis://") || val.startsWith("rediss://")),
          message: "REDIS_URL must be a valid Redis connection string",
        },
      ];

      const invalidConfigs = requiredConfigs.filter(
        ({ value, validator }) => !value || !validator(value)
      );

      if (invalidConfigs.length > 0) {
        const errorMessages = invalidConfigs.map(
          ({ key, message }) => `${key}: ${message}`
        );
        throw new Error(`Configuration validation failed:\n${errorMessages.join("\n")}`);
      }
    } else {
      // Development environment: only check if environment variables are set, don't validate format
      const warnings: string[] = [];

      if (
        !process.env["JWT_SECRET"] ||
        config.jwt?.secret === "your-super-secret-jwt-key-here"
      ) {
        warnings.push("Warning: Using default JWT_SECRET, please set a strong key for production");
      }

      if (
        !process.env["DATABASE_URL"] ||
        config.database?.url?.includes("username:password")
      ) {
        warnings.push("Warning: Using default DATABASE_URL, please set correct database connection");
      }

      if (
        !process.env["REDIS_URL"] ||
        config.redis?.url === "redis://localhost:6379"
      ) {
        warnings.push("Warning: Using default REDIS_URL, please set correct Redis connection");
      }

      if (warnings.length > 0) {
        console.warn("Configuration warnings:\n" + warnings.join("\n"));
      }
    }

    return config as AppConfig;
  }

  getConfig(): AppConfig {
    return ConfigService.loadConfig();
  }
}
