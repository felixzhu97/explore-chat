---
name: spring-ai
description: Spring AI 2.0 Development Guide. Covers ChatClient API, Structured Output, RAG, Tool Calling, Embeddings, Vector Store, MCP Integration, Clean Architecture Integration.
version: "2.0"
lastUpdated: "2026-06-20"
---

> **Prerequisite**: This skill is based on Spring AI 2.0 official documentation and best practices for building AI applications

---

# Spring AI 2.0 Development Guide

## Version Requirements

| Component   | Version Requirement |
| ----------- | ------------------- |
| Spring Boot | 4.0.x or 4.1.x      |
| Java        | 21+                 |
| Spring AI   | 2.0.x               |

---

## Core Concepts

### 1. ChatClient API

`ChatClient` is the core API of Spring AI, providing a streaming API design similar to `WebClient` / `RestClient`.

```java
@RestController
public class ChatController {

    private final ChatClient chatClient;

    public ChatController(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    // Basic call
    @GetMapping("/chat")
    public String chat(@RequestParam String message) {
        return chatClient.prompt()
            .user(message)
            .call()
            .content();
    }

    // Streaming response
    @GetMapping("/chat/stream")
    public Flux<String> chatStream(@RequestParam String message) {
        return chatClient.prompt()
            .user(message)
            .stream()
            .content();
    }
}
```

### 2. Structured Output

Use the `.entity()` method to map LLM output to Java objects:

```java
// Define data model
public record Recipe(
    String name,
    List<String> ingredients,
    List<String> instructions,
    int cookingTimeMinutes
) {}

// Call
Recipe recipe = chatClient.prompt()
    .user("Generate a pasta recipe with tomato sauce")
    .call()
    .entity(Recipe.class);

// Generics support
List<Recipe> recipes = chatClient.prompt()
    .user("Generate 3 pasta recipes")
    .call()
    .entity(new ParameterizedTypeReference<List<Recipe>>() {});
```

**Enable native structured output** (more reliable):

```java
Recipe recipe = chatClient.prompt()
    .advisors(AdvisorParams.ENABLE_NATIVE_STRUCTURED_OUTPUT)
    .user("Generate a lasagna recipe")
    .call()
    .entity(Recipe.class);
```

---

## Quick Start

### Dependency Management

**Maven:**

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-bom</artifactId>
            <version>2.0.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <!-- OpenAI -->
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-starter-model-openai</artifactId>
    </dependency>

    <!-- Ollama -->
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-starter-model-ollama</artifactId>
    </dependency>

    <!-- ChatClient (Required) -->
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-client-chat</artifactId>
    </dependency>

    <!-- Vector Store -->
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-pgvector-store-spring-boot-starter</artifactId>
    </dependency>
</dependencies>
```

**Gradle:**

```kotlin
dependencies {
    implementation(platform("org.springframework.ai:spring-ai-bom:2.0.0"))

    implementation("org.springframework.ai:spring-ai-starter-model-openai")
    implementation("org.springframework.ai:spring-ai-starter-model-ollama")
    implementation("org.springframework.ai:spring-ai-client-chat")
    implementation("org.springframework.ai:spring-ai-pgvector-store-spring-boot-starter")
}
```

### Configuration

**application.yml:**

```yaml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      chat:
        options:
          model: gpt-4o
          temperature: 0.7
    ollama:
      base-url: http://localhost:11434
      chat:
        options:
          model: llama3.2
```

---

## Tool Calling

### Declarative Tool Definition

Use the `@Tool` annotation to define tools:

```java
@Service
public class WeatherTools {

    @Tool(description = "Get current weather for a city")
    public String getWeather(@ToolParam(description = "City name") String city) {
        // Call weather API
        return "Sunny, 25°C in " + city;
    }

    @Tool(description = "Get forecast for multiple days")
    public String getForecast(
            @ToolParam(description = "City name") String city,
            @ToolParam(description = "Number of days") int days) {
        return "5-day forecast for " + city;
    }
}
```

### Registration and Usage

```java
@RestController
public class ChatController {

    private final ChatClient chatClient;
    private final WeatherTools weatherTools;

    public ChatController(ChatClient.Builder builder, WeatherTools weatherTools) {
        this.chatClient = builder.build();
        this.weatherTools = weatherTools;
    }

    @GetMapping("/chat")
    public String chat(@RequestParam String message) {
        return chatClient.prompt()
            .user(message)
            .tools(weatherTools)  // Register tools
            .call()
            .content();
    }
}
```

### MCP Tool Provider

```java
@Bean
public CommandLineRunner demo(ChatClient chatClient, ToolCallbackProvider mcpTools) {
    return args -> {
        String response = chatClient.prompt()
            .user("What's the weather in Paris?")
            .tools(mcpTools)  // Use MCP tools
            .call()
            .content();
    };
}
```

---

## Chat Memory

### MessageChatMemoryAdvisor

```java
@Configuration
public class ChatConfig {

    @Bean
    public ChatClient chatClient(ChatModel chatModel, ChatMemory chatMemory) {
        return ChatClient.builder(chatModel)
            .defaultAdvisors(
                MessageChatMemoryAdvisor.builder(chatMemory).build()
            )
            .build();
    }
}
```

### Using Chat Memory

```java
@GetMapping("/chat")
public String chat(@RequestParam String sessionId, @RequestParam String message) {
    return chatClient.prompt()
        .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, sessionId))
        .user(message)
        .call()
        .content();
}
```

> **Note**: Spring AI 2.0 requires explicit conversation ID for all memory advisors.

---

## RAG (Retrieval-Augmented Generation)

### ETL Pipeline

```java
@Service
public class DocumentIngestionService {

    private final VectorStore vectorStore;
    private final TokenTextSplitter textSplitter;

    public DocumentIngestionService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
        this.textSplitter = new TokenTextSplitter(
            512,   // chunk size (tokens)
            100,   // overlap (tokens)
            5,     // min chunk size chars
            10000, // max chunk size chars
            true   // keep separator
        );
    }

    public void ingestPdf(Resource pdfResource) {
        // 1. Read PDF
        PagePdfDocumentReader reader = new PagePdfDocumentReader(pdfResource,
            PdfDocumentReaderConfig.builder()
                .withPageExtractedTextFormatter(
                    ExtractedTextFormatter.builder().build()
                )
                .build());

        List<Document> documents = reader.get();

        // 2. Split into chunks
        List<Document> chunks = textSplitter.apply(documents);

        // 3. Add metadata
        chunks.forEach(chunk -> {
            chunk.getMetadata().put("source", pdfResource.getFilename());
            chunk.getMetadata().put("ingestedAt", Instant.now().toString());
        });

        // 4. Store (auto-embedding)
        vectorStore.add(chunks);
    }
}
```

### RAG Query

```java
@Service
public class RagQueryService {

    private final ChatClient chatClient;
    private final RetrievalAugmentationAdvisor ragAdvisor;

    public RagQueryService(ChatClient chatClient, VectorStore vectorStore) {
        this.chatClient = chatClient;
        this.ragAdvisor = RetrievalAugmentationAdvisor.builder()
            .documentRetriever(
                VectorStoreDocumentRetriever.builder()
                    .vectorStore(vectorStore)
                    .build()
            )
            .build();
    }

    public String query(String question) {
        return chatClient.prompt()
            .advisors(ragAdvisor)
            .user(question)
            .call()
            .content();
    }
}
```

---

## Vector Store

### PostgreSQL/PGVector Configuration

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/postgres
    username: postgres
    password: postgres

  ai:
    vectorstore:
      pgvector:
        initialize-schema: true
        index-type: HNSW
        distance-type: COSINE_DISTANCE
        dimensions: 1536
```

### Manual Configuration

```java
@Bean
public VectorStore vectorStore(JdbcTemplate jdbcTemplate, EmbeddingModel embeddingModel) {
    return PgVectorStore.builder(jdbcTemplate, embeddingModel)
        .dimensions(1536)
        .distanceType(PgDistanceType.COSINE_DISTANCE)
        .indexType(PgIndexType.HNSW)
        .initializeSchema(true)
        .schemaName("public")
        .vectorTableName("vector_store")
        .build();
}
```

### Similarity Search

```java
List<Document> results = vectorStore.similaritySearch(
    SearchRequest.builder()
        .query("What is Spring AI?")
        .topK(5)
        .build()
);

// With filter
List<Document> filteredResults = vectorStore.similaritySearch(
    SearchRequest.builder()
        .query("Java programming")
        .topK(10)
        .filterExpression(
            FilterExpressionBuilder.builder()
                .eq("source", "tutorial.pdf")
                .build()
        )
        .build()
);
```

---

## MCP (Model Context Protocol)

### MCP Server

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-mcp-server-webmvc</artifactId>
</dependency>
```

```yaml
spring:
  ai:
    mcp:
      server:
        type: SYNC
        protocol: STREAMABLE
```

### MCP Client

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-mcp-client</artifactId>
</dependency>
```

```yaml
spring:
  ai:
    mcp:
      client:
        streamable-http:
          connections:
            weather-server:
              url: http://localhost:8080
```

### MCP Annotations

```java
@McpTool(description = "Get weather information")
public String getWeather(@McpToolParam(description = "City name") String city) {
    return "Weather for " + city + ": Sunny, 25°C";
}

@McpResource(uri = "docs://tutorial/spring-ai")
public String getSpringAiDocs() {
    return "Spring AI documentation content...";
}
```

---

## Observability

### Add Dependencies

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-otel</artifactId>
</dependency>
```

### Configuration

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  metrics:
    export:
      prometheus:
        enabled: true
  tracing:
    sampling:
      probability: 1.0
```

### Custom Monitoring

```java
@Configuration
public class AiObservabilityConfig {

    @Bean
    public ObservationRegistryCustomizer<ObservationRegistry> aiMetricsCustomizer() {
        return registry -> registry.observationConfig()
            .observationHandler(new CustomAiObservationHandler());
    }
}
```

---

## Clean Architecture Integration

### Layered Architecture

```
src/main/java/com/ai/
├── domain/                    # Domain Layer (Core, no AI dependencies)
│   └── model/
│       └── Order.java
│
├── application/               # Application Layer (Use case orchestration)
│   ├── usecase/
│   │   └── AnalyzeDocumentUseCase.java
│   └── port/                  # Port interfaces
│       ├── AiPort.java
│       └── VectorStorePort.java
│
├── infrastructure/            # Infrastructure Layer (Implementations)
│   ├── ai/
│   │   ├── SpringAiAdapter.java
│   │   └── VectorStoreAdapter.java
│   └── config/
│       └── SpringAiConfig.java
│
└── interface/                 # Interface Layer
    └── controller/
        └── AiController.java
```

### Domain Layer (No AI Dependencies)

```java
// Domain Layer: Pure business logic, no Spring AI dependencies
public class DocumentAnalysis {
    private final DocumentId id;
    private final String content;
    private final AnalysisResult result;

    public void analyzeWithAi(AiPort aiPort) {
        String prompt = buildAnalysisPrompt();
        String response = aiPort.complete(prompt);
        this.result = AnalysisResult.parse(response);
    }

    private String buildAnalysisPrompt() {
        return String.format("Analyze this document: %s", content);
    }
}
```

### Application Layer (Define Ports)

```java
// Application Layer: Define AI port interfaces
public interface AiPort {
    String complete(String prompt);
    <T> T complete(String prompt, Class<T> responseType);
}

public interface VectorStorePort {
    void store(Document document);
    List<Document> search(String query, int topK);
}
```

### Infrastructure Layer (Implement)

```java
// Infrastructure Layer: Implement AI port
@Service
@Primary
public class SpringAiAdapter implements AiPort {

    private final ChatClient chatClient;

    public SpringAiAdapter(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @Override
    public String complete(String prompt) {
        return chatClient.prompt()
            .user(prompt)
            .call()
            .content();
    }

    @Override
    public <T> T complete(String prompt, Class<T> responseType) {
        return chatClient.prompt()
            .user(prompt)
            .call()
            .entity(responseType);
    }
}
```

### Use Case Layer (Orchestration)

```java
@Service
public class AnalyzeDocumentUseCase {

    private final DocumentRepository documentRepository;
    private final AiPort aiPort;

    public AnalyzeDocumentUseCase(
            DocumentRepository documentRepository,
            @Qualifier("springAiAdapter") AiPort aiPort) {
        this.documentRepository = documentRepository;
        this.aiPort = aiPort;
    }

    public AnalysisResult execute(DocumentId documentId) {
        Document document = documentRepository.findById(documentId)
            .orElseThrow(() -> new DocumentNotFoundException(documentId));

        document.analyzeWithAi(aiPort);
        documentRepository.save(document);

        return document.getResult();
    }
}
```

---

## Model Providers

| Provider     | Dependency                             | Configuration                     |
| ------------ | -------------------------------------- | --------------------------------- |
| OpenAI       | `spring-ai-starter-model-openai`       | `spring.ai.openai.api-key`        |
| Anthropic    | `spring-ai-starter-model-anthropic`    | `spring.ai.anthropic.api-key`     |
| Google       | `spring-ai-starter-model-google`       | `spring.ai.google.api-key`        |
| Ollama       | `spring-ai-starter-model-ollama`       | `spring.ai.ollama.base-url`       |
| Azure OpenAI | `spring-ai-starter-model-azure-openai` | `spring.ai.azure.openai.endpoint` |

### Ollama Example

```yaml
spring:
  ai:
    ollama:
      base-url: http://localhost:11434
      chat:
        options:
          model: llama3.2
          temperature: 0.7
          num-gpu: 1
```

### Embedding Models

```yaml
spring:
  ai:
    openai:
      embedding:
        enabled: true
        options:
          model: text-embedding-3-small

    ollama:
      embedding:
        enabled: true
        options:
          model: nomic-embed-text
```

---

## Best Practices

### 1. Dependency Management

- Use BOM for version management
- Include dependencies as needed, avoid unnecessary AI providers
- Use environment variables for API keys in production

### 2. Error Handling

```java
@GetMapping("/chat")
public ResponseEntity<String> chat(@RequestParam String message) {
    try {
        String response = chatClient.prompt()
            .user(message)
            .call()
            .content();
        return ResponseEntity.ok(response);
    } catch (AiException e) {
        log.error("AI service error: {}", e.getMessage());
        return ResponseEntity.status(503).body("AI service unavailable");
    }
}
```

### 3. Retry Mechanism

```java
@Bean
public RetryTemplate aiRetryTemplate() {
    return RetryTemplate.builder()
        .maxAttempts(3)
        .fixedBackoff(1000)
        .retryOn(AiException.class)
        .build();
}
```

### 4. Prompt Templates

```java
@Component
public class PromptTemplates {

    private static final String ANALYSIS_TEMPLATE = """
        You are an expert analyst. Analyze the following content:

        Context: {context}

        Provide:
        1. Summary (max 100 words)
        2. Key points (3-5 items)
        3. Sentiment (positive/neutral/negative)
        """;

    public String buildAnalysisPrompt(String context) {
        return ANALYSIS_TEMPLATE.replace("{context}", context);
    }
}
```

### 5. Vector Database Selection

| Scenario                    | Recommendation        |
| --------------------------- | --------------------- |
| Small-scale prototype       | PgVector (PostgreSQL) |
| Large-scale production      | Pinecone / Qdrant     |
| Graph relationship analysis | Neo4j                 |
| Simple deployment           | Chroma                |

---

## FAQ

### Q: How to choose a model?

| Scenario             | Recommended Model            |
| -------------------- | ---------------------------- |
| General conversation | GPT-4o / Claude 3.5 Sonnet   |
| Cost-sensitive       | GPT-4o-mini / Claude 3 Haiku |
| Local deployment     | Ollama (Llama 3.2, Mistral)  |
| Function calling     | GPT-4o / Claude 3.5 Sonnet   |

### Q: How to handle long context?

Use RAG instead of long context:

- Document chunking (512-1024 tokens)
- Retrieve relevant chunks
- Pass only relevant context

### Q: How to improve structured output accuracy?

1. Use native structured output (`AdvisorParams.ENABLE_NATIVE_STRUCTURED_OUTPUT`)
2. Specify output format clearly in prompt
3. Provide examples (few-shot)

---

## Upgrade Guide

### From 1.x to 2.0

| Change                                  | Description                  |
| --------------------------------------- | ---------------------------- |
| FunctionCallback → ToolCallback         | Use `@Tool` annotation       |
| `functions()` → `tools()`               | API renamed                  |
| `defaultFunctions()` → `defaultTools()` | API renamed                  |
| PromptChatMemoryAdvisor removed         | Use MessageChatMemoryAdvisor |
| Conversation ID required                | Must provide explicitly      |
| MCP SDK 1.0+                            | Requires MCP Java SDK 1.0.0  |

### Breaking Changes

1. **ChatMemoryAdvisor requires conversation ID**
2. **MCP dependencies moved to `org.springframework.ai`**
3. **Vector store schema initialization requires explicit enable**
