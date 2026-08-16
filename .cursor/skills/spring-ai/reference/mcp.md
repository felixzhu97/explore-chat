# Spring AI 2.0 - Model Context Protocol (MCP) Reference

> **Version**: Spring AI 2.0 (Development)  
> **MCP SDK**: 1.0.0+ (RC1 or later)  
> **Last Updated**: 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Spring AI MCP Support](#2-spring-ai-mcp-support)
3. [MCP Client](#3-mcp-client)
4. [MCP Server](#4-mcp-server)
5. [Use Cases](#5-use-cases)
6. [Configuration](#6-configuration)
7. [Best Practices](#7-best-practices)

---

## 1. Overview

### What is MCP?

The **Model Context Protocol (MCP)** is a standardized protocol that enables AI models to interact with external tools and resources in a structured way. Think of it as a bridge between your AI models and the real world—allowing them to access databases, APIs, file systems, and other external services through a consistent interface.

### MCP Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      MCP Stack Architecture                   │
├─────────────────────────────────────────────────────────────┤
│                      Client/Server Layer                     │
│  ┌─────────────────┐              ┌─────────────────┐      │
│  │    McpClient     │◄────────────►│    McpServer     │      │
│  └─────────────────┘              └─────────────────┘      │
├─────────────────────────────────────────────────────────────┤
│                       Session Layer                          │
│  ┌─────────────────┐              ┌─────────────────┐      │
│  │ McpClientSession │              │ McpServerSession │      │
│  └─────────────────┘              └─────────────────┘      │
├─────────────────────────────────────────────────────────────┤
│                      Transport Layer                         │
│  ┌─────────────────────────────────────────────────┐        │
│  │              McpTransport (JSON-RPC)              │        │
│  │  STDIO  │  Streamable-HTTP  │  SSE  │  Stateless │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

| Layer         | Component          | Purpose                                                     |
| ------------- | ------------------ | ----------------------------------------------------------- |
| Client/Server | `McpClient`        | Manages client-side operations and server connections       |
| Client/Server | `McpServer`        | Handles server-side protocol operations and client requests |
| Session       | `McpSession`       | Core session management interface                           |
| Session       | `McpClientSession` | Client-specific session implementation                      |
| Session       | `McpServerSession` | Server-specific session implementation                      |
| Transport     | `McpTransport`     | JSON-RPC message serialization and deserialization          |

### MCP Capabilities

| Capability     | Description                                                 |
| -------------- | ----------------------------------------------------------- |
| **Tools**      | Servers expose tools that can be invoked by language models |
| **Resources**  | Standardized way for servers to expose resources to clients |
| **Prompts**    | Standardized way for servers to expose prompt templates     |
| **Completion** | Auto-completion suggestions for prompts and resource URIs   |
| **Logging**    | Structured log messages from servers to clients             |
| **Progress**   | Progress tracking for long-running operations               |
| **Sampling**   | Server-initiated LLM sampling requests                      |

---

## 2. Spring AI MCP Support

### Dependency Relocation (Spring AI 2.0 Breaking Change)

Starting with **Spring AI 2.0**, Spring-specific MCP transport implementations have moved from the MCP Java SDK to Spring AI itself.

| Artifact             | Old Group ID                  | New Group ID             |
| -------------------- | ----------------------------- | ------------------------ |
| `mcp-spring-webflux` | `io.modelcontextprotocol.sdk` | `org.springframework.ai` |
| `mcp-spring-webmvc`  | `io.modelcontextprotocol.sdk` | `org.springframework.ai` |

**Before (Spring AI < 2.0):**

```xml
<dependency>
    <groupId>io.modelcontextprotocol.sdk</groupId>
    <artifactId>mcp-spring-webflux</artifactId>
</dependency>
```

**After (Spring AI 2.0+):**

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-mcp-client-webflux</artifactId>
</dependency>
```

### Package Relocation

| Class                               | Old Package                                | New Package                                           |
| ----------------------------------- | ------------------------------------------ | ----------------------------------------------------- |
| `WebFluxSseServerTransportProvider` | `io.modelcontextprotocol.server.transport` | `org.springframework.ai.mcp.server.webflux.transport` |
| `WebMvcSseServerTransportProvider`  | `io.modelcontextprotocol.server.transport` | `org.springframework.ai.mcp.server.webmvc.transport`  |
| `WebFluxSseClientTransport`         | `io.modelcontextprotocol.client.transport` | `org.springframework.ai.mcp.client.webflux.transport` |
| `WebClientStreamableHttpTransport`  | `io.modelcontextprotocol.client.transport` | `org.springframework.ai.mcp.client.webflux.transport` |

### Available Starters

#### Client Starters

| Starter                                | Transport                   | Use Case                                 |
| -------------------------------------- | --------------------------- | ---------------------------------------- |
| `spring-ai-starter-mcp-client`         | STDIO, SSE, Streamable-HTTP | Standard servlet-based client            |
| `spring-ai-starter-mcp-client-webflux` | SSE, Streamable-HTTP        | Reactive (WebFlux) client for production |

#### Server Starters

| Starter                                | Protocol                        | Type             |
| -------------------------------------- | ------------------------------- | ---------------- |
| `spring-ai-starter-mcp-server`         | STDIO                           | Synchronous      |
| `spring-ai-starter-mcp-server-webmvc`  | SSE, Streamable-HTTP, Stateless | Synchronous      |
| `spring-ai-starter-mcp-server-webflux` | SSE, Streamable-HTTP, Stateless | Reactive (Async) |

---

## 3. MCP Client

### Overview

The MCP Client allows Spring AI applications to consume MCP servers. It establishes connections to one or more MCP servers and exposes their tools as Spring AI function callbacks.

### Dependencies

```xml
<!-- Standard Client -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-mcp-client</artifactId>
</dependency>

<!-- WebFlux Client (Recommended for Production) -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-mcp-client-webflux</artifactId>
</dependency>
```

### Server Protocols

| Protocol            | Description                               | Property                               |
| ------------------- | ----------------------------------------- | -------------------------------------- |
| **STDIO**           | In-process communication via stdin/stdout | `spring.ai.mcp.client.stdio`           |
| **Streamable-HTTP** | HTTP with optional SSE streaming          | `spring.ai.mcp.client.streamable-http` |
| **SSE**             | Server-Sent Events for real-time updates  | `spring.ai.mcp.client.sse`             |

### Configuration Examples

#### STDIO Transport

```yaml
spring:
  ai:
    mcp:
      client:
        stdio:
          connections:
            local-server:
              command: /path/to/mcp-server
              args:
                - --mode=production
                - --port=8080
              env:
                API_KEY: ${MCP_API_KEY}
```

Using Claude Desktop format (JSON):

```yaml
spring:
  ai:
    mcp:
      client:
        stdio:
          servers-configuration: classpath:mcp-servers.json
```

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/Desktop"
      ]
    }
  }
}
```

**Windows STDIO Configuration:**

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "cmd.exe",
      "args": [
        "/c",
        "npx",
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\username\\Desktop"
      ]
    }
  }
}
```

#### Streamable-HTTP Transport

```yaml
spring:
  ai:
    mcp:
      client:
        type: SYNC
        streamable-http:
          connections:
            server1:
              url: http://localhost:8080
              endpoint: /mcp
            server2:
              url: http://otherserver:8081
              endpoint: /custom-mcp
```

#### SSE Transport

```yaml
spring:
  ai:
    mcp:
      client:
        type: SYNC
        sse:
          connections:
            server1:
              url: http://localhost:8080
            mcp-hub:
              url: http://localhost:3000
              sse-endpoint: /mcp-hub/sse/token123
```

### Client Annotations

The MCP Client supports annotation-based handlers for various notifications:

#### Available Client Annotations

| Annotation                | Purpose                                   |
| ------------------------- | ----------------------------------------- |
| `@McpLogging`             | Handle logging messages from servers      |
| `@McpSampling`            | Handle sampling requests (LLM generation) |
| `@McpProgress`            | Handle progress notifications             |
| `@McpElicitation`         | Handle user elicitation requests          |
| `@McpToolListChanged`     | Handle tool list changes                  |
| `@McpResourceListChanged` | Handle resource list changes              |

#### Complete Client Handler Example

```java
@SpringBootApplication
public class McpClientApplication {
    public static void main(String[] args) {
        SpringApplication.run(McpClientApplication.class, args);
    }
}

@Component
public class ClientHandlers {

    private final Logger logger = LoggerFactory.getLogger(ClientHandlers.class);

    @McpLogging(clients = "server1")
    public void handleLogging(LoggingMessageNotification notification) {
        switch (notification.level()) {
            case ERROR:
                logger.error("[MCP] {} - {}", notification.logger(), notification.data());
                break;
            case WARNING:
                logger.warn("[MCP] {} - {}", notification.logger(), notification.data());
                break;
            case INFO:
                logger.info("[MCP] {} - {}", notification.logger(), notification.data());
                break;
            default:
                logger.debug("[MCP] {} - {}", notification.logger(), notification.data());
        }
    }

    @McpSampling(clients = "server1")
    public CreateMessageResult handleSampling(CreateMessageRequest request) {
        // Extract user prompt
        String userPrompt = ((TextContent) request.messages().get(0).content()).text();
        String modelHint = request.modelPreferences().hints().get(0).name();

        // Route to appropriate ChatClient based on model hint
        ChatClient chatClient = findChatClientByHint(modelHint);

        String response = chatClient.prompt()
                .system(request.systemPrompt())
                .user(userPrompt)
                .call()
                .content();

        return CreateMessageResult.builder(Role.ASSISTANT, response, modelHint)
                .build();
    }

    @McpProgress(clients = "server1")
    public void handleProgress(ProgressNotification notification) {
        logger.info("Progress [{}]: {}% - {}",
                notification.progressToken(),
                (int)(notification.progress() / notification.total() * 100),
                notification.message());
    }

    @McpToolListChanged(clients = "server1")
    public void handleToolsChanged(List<McpSchema.Tool> tools) {
        logger.info("Server tools updated: {} tools available", tools.size());
        // Update tool registry
    }
}
```

### Integration with Spring AI Chat

```java
@RestController
@RequestMapping("/chat")
public class ChatController {

    private final ChatModel chatModel;
    private final SyncMcpToolCallbackProvider toolCallbackProvider;

    public ChatController(ChatModel chatModel,
                          SyncMcpToolCallbackProvider toolCallbackProvider) {
        this.chatModel = chatModel;
        this.toolCallbackProvider = toolCallbackProvider;
    }

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request) {
        // Get MCP tools as Spring AI function callbacks
        ToolCallback[] mcpTools = toolCallbackProvider.getToolCallbacks();

        // Create prompt with MCP tools available
        Prompt prompt = new Prompt(
            request.getMessage(),
            ChatOptionsBuilder.builder()
                .withTools(mcpTools)
                .build()
        );

        return chatModel.call(prompt);
    }
}
```

### Multi-Model Sampling Example

```java
@Service
public class MultiModelMcpClientHandlers {

    @Autowired
    Map<String, ChatClient> chatClients;

    @McpSampling(clients = "server1")
    public CreateMessageResult samplingHandler(CreateMessageRequest request) {
        // Extract model hint from request
        var userPrompt = ((McpSchema.TextContent) request.messages().get(0).content()).text();
        String modelHint = request.modelPreferences().hints().get(0).name();

        // Find appropriate ChatClient based on model hint
        ChatClient hintedChatClient = chatClients.entrySet().stream()
                .filter(e -> e.getKey().contains(modelHint))
                .findFirst()
                .orElseThrow()
                .getValue();

        String response = hintedChatClient.prompt()
                .system(request.systemPrompt())
                .user(userPrompt)
                .call()
                .content();

        return CreateMessageResult.builder(Role.ASSISTANT, response, modelHint)
                .build();
    }
}
```

### Client Properties Reference

| Property                                          | Description                 | Default                |
| ------------------------------------------------- | --------------------------- | ---------------------- |
| `spring.ai.mcp.client.enabled`                    | Enable/disable MCP client   | `true`                 |
| `spring.ai.mcp.client.name`                       | Client instance name        | `spring-ai-mcp-client` |
| `spring.ai.mcp.client.version`                    | Client version              | `1.0.0`                |
| `spring.ai.mcp.client.type`                       | SYNC or ASYNC               | `SYNC`                 |
| `spring.ai.mcp.client.initialized`                | Auto-initialize on creation | `true`                 |
| `spring.ai.mcp.client.request-timeout`            | Request timeout             | `20s`                  |
| `spring.ai.mcp.client.toolcallback.enabled`       | Tool callback integration   | `true`                 |
| `spring.ai.mcp.client.annotation-scanner.enabled` | Enable annotation scanning  | `true`                 |

---

## 4. MCP Server

### Overview

MCP Servers expose specific capabilities (tools, resources, prompts) to AI clients through standardized protocol interfaces. Spring AI provides annotation-based server development with auto-configuration.

### Dependencies

```xml
<!-- STDIO Server -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-mcp-server</artifactId>
</dependency>

<!-- WebMVC Server (Servlet-based) -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-mcp-server-webmvc</artifactId>
</dependency>

<!-- WebFlux Server (Reactive) - Recommended -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-mcp-server-webflux</artifactId>
</dependency>
```

### Server Protocols

| Protocol            | Description                                     | Property                                   |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| **STDIO**           | In-process communication                        | `spring.ai.mcp.server.stdio=true`          |
| **Streamable-HTTP** | HTTP with optional SSE streaming (replaces SSE) | `spring.ai.mcp.server.protocol=STREAMABLE` |
| **Stateless**       | No session state, ideal for microservices       | `spring.ai.mcp.server.protocol=STATELESS`  |
| **SSE**             | Server-Sent Events (deprecated, use STREAMABLE) | `spring.ai.mcp.server.protocol=SSE`        |

### Server Types

| Type      | Description                           | Property                          |
| --------- | ------------------------------------- | --------------------------------- |
| **SYNC**  | Synchronous request-response patterns | `spring.ai.mcp.server.type=SYNC`  |
| **ASYNC** | Non-blocking operations with Reactor  | `spring.ai.mcp.server.type=ASYNC` |

### Server Annotations

| Annotation         | Purpose                                                    |
| ------------------ | ---------------------------------------------------------- |
| `@McpTool`         | Mark methods as MCP tools with auto JSON schema generation |
| `@McpResource`     | Provide access to resources via URI templates              |
| `@McpPrompt`       | Generate prompt messages for AI interactions               |
| `@McpComplete`     | Provide auto-completion for prompts                        |
| `@McpToolCallback` | Custom tool callback implementation                        |
| `@McpSampling`     | Handle sampling requests from clients                      |

### Special Parameters

| Parameter                                          | Description                                  |
| -------------------------------------------------- | -------------------------------------------- |
| `McpSyncRequestContext` / `McpAsyncRequestContext` | Full server context for operations           |
| `McpTransportContext`                              | Lightweight context for stateless operations |
| `McpMeta`                                          | Access metadata from MCP requests            |
| `CallToolRequest`                                  | Raw tool request for dynamic schemas         |
| `@McpProgressToken`                                | Receive progress tokens for long operations  |

### Basic Server Example

```java
@SpringBootApplication
public class CalculatorServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(CalculatorServerApplication.class, args);
    }
}

@Component
public class CalculatorTools {

    @McpTool(name = "add", description = "Add two numbers")
    public double add(
            @McpToolParam(description = "First number", required = true) double a,
            @McpToolParam(description = "Second number", required = true) double b) {
        return a + b;
    }

    @McpTool(name = "subtract", description = "Subtract two numbers")
    public double subtract(
            @McpToolParam(description = "First number", required = true) double a,
            @McpToolParam(description = "Second number", required = true) double b) {
        return a - b;
    }

    @McpTool(name = "multiply", description = "Multiply two numbers")
    public double multiply(
            @McpToolParam(description = "First number", required = true) double a,
            @McpToolParam(description = "Second number", required = true) double b) {
        return a * b;
    }

    @McpTool(name = "divide", description = "Divide two numbers")
    public double divide(
            @McpToolParam(description = "Dividend", required = true) double dividend,
            @McpToolParam(description = "Divisor", required = true) double divisor) {
        if (divisor == 0) {
            throw new IllegalArgumentException("Division by zero");
        }
        return dividend / divisor;
    }
}
```

### Resources and Prompts Example

```java
@Component
public class DocumentServer {

    private final Map<String, Document> documents = new ConcurrentHashMap<>();

    @McpResource(
        uri = "document://{id}",
        name = "Document",
        description = "Access stored documents")
    public ReadResourceResult getDocument(String id, McpMeta meta) {
        Document doc = documents.get(id);

        if (doc == null) {
            return ReadResourceResult.builder(List.of(
                new TextResourceContents("document://" + id,
                    "text/plain", "Document not found")
            )).build();
        }

        return ReadResourceResult.builder(List.of(
            new TextResourceContents("document://" + id,
                doc.getMimeType(), doc.getContent())
        )).build();
    }

    @McpTool(name = "analyze-document", description = "Analyze document content")
    public String analyzeDocument(
            McpSyncRequestContext context,
            @McpToolParam(description = "Document ID", required = true) String docId,
            @McpToolParam(description = "Analysis type", required = false) String type) {

        Document doc = documents.get(docId);
        if (doc == null) {
            return "Document not found";
        }

        // Send progress updates
        String progressToken = context.request().progressToken();
        if (progressToken != null) {
            context.progress(p -> p.progress(0.5).total(1.0).message("Analysis in progress"));
        }

        return performAnalysis(doc, type != null ? type : "summary");
    }

    @McpPrompt(
        name = "document-summary",
        description = "Generate document summary prompt")
    public GetPromptResult documentSummaryPrompt(
            @McpArg(name = "docId", required = true) String docId,
            @McpArg(name = "length", required = false) String length) {

        Document doc = documents.get(docId);
        if (doc == null) {
            return GetPromptResult.builder(List.of(
                new PromptMessage(Role.SYSTEM,
                    TextContent.builder("Document not found").build())
            )).build();
        }

        String promptText = String.format(
            "Please summarize the following document in %s:\n\n%s",
            length != null ? length : "a few paragraphs",
            doc.getContent()
        );

        return GetPromptResult.builder(List.of(
            new PromptMessage(Role.USER, TextContent.builder(promptText).build())
        )).build();
    }

    @McpComplete(prompt = "document-summary")
    public List<String> completeDocumentId(String prefix) {
        return documents.keySet().stream()
            .filter(id -> id.startsWith(prefix))
            .sorted()
            .limit(10)
            .toList();
    }
}
```

### Advanced: Dynamic Tool with CallToolRequest

```java
@Component
public class AdvancedTools {

    @McpTool(name = "calculate-expression",
             description = "Calculate a complex mathematical expression")
    public CallToolResult calculateExpression(
            CallToolRequest request,
            McpSyncRequestContext context) {

        Map<String, Object> args = request.arguments();
        String expression = (String) args.get("expression");

        context.info("Calculating: " + expression);

        try {
            double result = evaluateExpression(expression);
            return CallToolResult.builder()
                .addTextContent("Result: " + result)
                .build();
        } catch (Exception e) {
            return CallToolResult.builder()
                .isError(true)
                .addTextContent("Error: " + e.getMessage())
                .build();
        }
    }
}
```

### Transport Context Extraction

```java
// WebMVC Transport Configuration
@Bean
public WebMvcStreamableServerTransportProvider transportProvider() {
    return WebMvcStreamableServerTransportProvider.builder()
        .contextExtractor(serverRequest -> {
            String authorization = serverRequest.headers().firstHeader("Authorization");
            String remoteHost = serverRequest.remoteAddress().getHostString();
            return McpTransportContext.create(Map.of(
                "authorization", authorization,
                "remoteHost", remoteHost
            ));
        })
        .build();
}

// Access in tool
@McpTool(name = "protected-resource", description = "Access with auth context")
public String accessProtectedResource(McpSyncRequestContext context) {
    McpTransportContext transportContext = context.transportContext();
    String auth = (String) transportContext.get("authorization");
    // Validate and process...
    return "Success";
}
```

### Async Server Example

```java
@Component
public class AsyncDataProcessor {

    @McpTool(name = "fetch-data", description = "Fetch data from external source")
    public Mono<DataResult> fetchData(
            @McpToolParam(description = "Data source URL", required = true) String url,
            @McpToolParam(description = "Timeout in seconds", required = false) Integer timeout) {

        Duration timeoutDuration = Duration.ofSeconds(timeout != null ? timeout : 30);

        return WebClient.create()
            .get()
            .uri(url)
            .retrieve()
            .bodyToMono(String.class)
            .map(data -> new DataResult(url, data, System.currentTimeMillis()))
            .timeout(timeoutDuration)
            .onErrorReturn(new DataResult(url, "Error fetching data", 0L));
    }

    @McpTool(name = "process-stream", description = "Process data stream")
    public Flux<String> processStream(
            McpAsyncRequestContext context,
            @McpToolParam(description = "Item count", required = true) int count) {

        return Flux.range(1, count)
            .delayElements(Duration.ofMillis(100))
            .flatMap(i -> {
                double progress = (double) i / count;
                return context.progress(p -> p.progress(progress).total(1.0).message("Item " + i))
                    .thenReturn("Processed item " + i);
            });
    }

    @McpResource(uri = "async-data://{id}", name = "Async Data")
    public Mono<ReadResourceResult> getAsyncData(String id) {
        return Mono.fromCallable(() -> loadDataAsync(id))
            .subscribeOn(Schedulers.boundedElastic())
            .map(data -> ReadResourceResult.builder(List.of(
                new TextResourceContents("async-data://" + id, "application/json", data)
            )).build());
    }
}
```

### Server Properties Reference

| Property                                          | Description                | Default |
| ------------------------------------------------- | -------------------------- | ------- |
| `spring.ai.mcp.server.name`                       | Server name                | -       |
| `spring.ai.mcp.server.version`                    | Server version             | -       |
| `spring.ai.mcp.server.type`                       | SYNC or ASYNC              | `SYNC`  |
| `spring.ai.mcp.server.protocol`                   | STREAMABLE, STATELESS, SSE | -       |
| `spring.ai.mcp.server.stdio`                      | Enable STDIO transport     | `false` |
| `spring.ai.mcp.server.capabilities.tools`         | Enable tools               | `true`  |
| `spring.ai.mcp.server.capabilities.resources`     | Enable resources           | `true`  |
| `spring.ai.mcp.server.capabilities.prompts`       | Enable prompts             | `true`  |
| `spring.ai.mcp.server.capabilities.completion`    | Enable completion          | `true`  |
| `spring.ai.mcp.server.annotation-scanner.enabled` | Enable annotation scanning | `true`  |

---

## 5. Use Cases

### 5.1 Connecting to External AI Tools

Expose external AI services (translation, image generation, etc.) as MCP tools:

```java
@Component
public class AITools {

    private final TranslationService translationService;
    private final ImageService imageService;

    @McpTool(name = "translate", description = "Translate text between languages")
    public TranslationResult translate(
            @McpToolParam(description = "Text to translate", required = true) String text,
            @McpToolParam(description = "Source language code", required = true) String sourceLang,
            @McpToolParam(description = "Target language code", required = true) String targetLang) {
        return translationService.translate(text, sourceLang, targetLang);
    }

    @McpTool(name = "generate-image", description = "Generate image from description")
    public ImageResult generateImage(
            @McpToolParam(description = "Image description", required = true) String description,
            @McpToolParam(description = "Image style", required = false) String style) {
        return imageService.generate(description, style);
    }
}
```

### 5.2 Integrating Enterprise Systems

Connect AI models to internal enterprise systems:

```java
@Component
public class EnterpriseTools {

    private final OrderService orderService;
    private final InventoryService inventoryService;

    @McpTool(name = "check-order-status", description = "Check order status")
    public OrderStatus checkOrderStatus(
            @McpToolParam(description = "Order ID", required = true) String orderId) {
        return orderService.getStatus(orderId);
    }

    @McpTool(name = "check-inventory", description = "Check product inventory")
    public InventoryInfo checkInventory(
            @McpToolParam(description = "Product SKU", required = true) String sku,
            @McpToolParam(description = "Warehouse location", required = false) String warehouse) {
        return inventoryService.checkStock(sku, warehouse);
    }

    @McpResource(uri = "employee://{id}", name = "Employee Profile")
    public ReadResourceResult getEmployeeProfile(String id) {
        Employee emp = employeeService.findById(id);
        return ReadResourceResult.builder(List.of(
            new JsonResourceContents("employee://" + id, toJson(emp))
        )).build();
    }
}
```

### 5.3 MCP Sampling with Multiple LLM Providers

Server can request content generation from client's LLM:

```java
@Service
public class WeatherService {

    private final RestClient restClient = RestClient.create();

    @McpTool(description = "Get temperature and creative poem for location")
    public String getWeatherWithPoem(McpSyncServerExchange exchange,
            @McpToolParam(description = "Latitude") double latitude,
            @McpToolParam(description = "Longitude") double longitude) {

        // Fetch weather data
        WeatherResponse weather = restClient
            .get()
            .uri("https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m",
                latitude, longitude)
            .retrieve()
            .body(WeatherResponse.class);

        // Check if client supports sampling
        if (exchange.getClientCapabilities().sampling() != null) {
            var samplingRequest = CreateMessageRequest.builder(
                List.of(new McpSchema.SamplingMessage(McpSchema.Role.USER,
                    McpSchema.TextContent.builder(
                        "Write a short poem about this weather: " + toJson(weather)
                    ).build()
                )), 500
            ).systemPrompt("You are a poet!")
             .modelPreferences(ModelPreferences.builder()
                 .addHint("openai")
                 .build())
             .build();

            // Request poem from client's LLM
            CreateMessageResult poem = exchange.createMessage(samplingRequest);
            return ((McpSchema.TextContent) poem.content()).text();
        }

        return "Temperature: " + weather.current().temperature_2m() + "°C";
    }
}
```

### 5.4 Stateless Microservices Integration

For cloud-native deployments with stateless MCP servers:

```java
@Component
public class StatelessTools {

    @McpTool(name = "validate-order", description = "Validate order data")
    public CallToolResult validateOrder(
            McpTransportContext context,
            @McpToolParam(description = "Order JSON", required = true) String orderJson) {

        try {
            Order order = objectMapper.readValue(orderJson, Order.class);
            ValidationResult result = validationService.validate(order);

            if (result.isValid()) {
                return CallToolResult.builder()
                    .addTextContent("Order is valid")
                    .structuredContent(Map.of("valid", true, "orderId", order.getId()))
                    .build();
            } else {
                return CallToolResult.builder()
                    .addTextContent("Order validation failed: " + result.getErrors())
                    .structuredContent(Map.of("valid", false, "errors", result.getErrors()))
                    .build();
            }
        } catch (JsonProcessingException e) {
            return CallToolResult.builder()
                .isError(true)
                .addTextContent("Invalid JSON: " + e.getMessage())
                .build();
        }
    }

    @McpResource(uri = "config://{key}", name = "Configuration")
    public String getConfig(String key) {
        return configService.get(key);
    }
}
```

---

## 6. Configuration

### Complete Configuration Reference

#### Server Configuration (application.yaml)

```yaml
spring:
  application:
    name: mcp-server

  ai:
    mcp:
      server:
        # Basic settings
        name: my-mcp-server
        version: 1.0.0
        type: SYNC # or ASYNC
        protocol: STREAMABLE # or STATELESS, SSE
        stdio: false

        # Capabilities
        capabilities:
          tool: true
          resource: true
          prompt: true
          completion: true
          logging: true
          progress: true

        # Annotation scanning
        annotation-scanner:
          enabled: true

# Logging
logging:
  level:
    org.springframework.ai.mcp: DEBUG
    org.springframework.ai.mcp.server: INFO
```

#### Client Configuration (application.yaml)

```yaml
spring:
  application:
    name: mcp-client

  ai:
    mcp:
      client:
        # Basic settings
        type: SYNC
        name: spring-ai-mcp-client
        version: 1.0.0
        initialized: true
        request-timeout: 30s

        # Tool callback integration
        toolcallback:
          enabled: true

        # Annotation scanning
        annotation-scanner:
          enabled: true

        # STDIO connections
        stdio:
          servers-configuration: classpath:mcp-servers.json

        # Streamable-HTTP connections
        streamable-http:
          connections:
            server1:
              url: http://localhost:8080
              endpoint: /mcp
            server2:
              url: http://otherserver:8081

        # SSE connections
        sse:
          connections:
            mcp-hub:
              url: http://localhost:3000
              sse-endpoint: /mcp-hub/sse/token123
```

### Transport Configuration Beans

#### WebFlux Server with Context Extraction

```java
@Configuration
public class McpServerConfig {

    @Bean
    public WebFluxStreamableServerTransportProvider streamableTransportProvider() {
        return WebFluxStreamableServerTransportProvider.builder()
            .contextExtractor(serverRequest -> {
                String auth = serverRequest.headers().firstHeader("Authorization");
                String traceId = serverRequest.headers().firstHeader("X-Trace-Id");
                return McpTransportContext.create(Map.of(
                    "authorization", auth != null ? auth : "",
                    "traceId", traceId != null ? traceId : ""
                ));
            })
            .build();
    }

    @Bean
    public WebFluxSseServerTransportProvider sseTransportProvider() {
        return WebFluxSseServerTransportProvider.builder()
            .contextExtractor(request -> McpTransportContext.empty())
            .build();
    }
}
```

#### WebMVC Server Configuration

```java
@Configuration
public class McpMvcServerConfig {

    @Bean
    public WebMvcStreamableServerTransportProvider streamableTransportProvider() {
        return WebMvcStreamableServerTransportProvider.builder()
            .contextExtractor(request -> {
                String clientIp = request.remoteAddress().getHostString();
                return McpTransportContext.create(Map.of("clientIp", clientIp));
            })
            .build();
    }
}
```

### Cross-Platform STDIO Configuration

```java
@Bean(destroyMethod = "close")
@ConditionalOnMissingBean(McpSyncClient.class)
public McpSyncClient mcpSyncClient() {
    ServerParameters stdioParams;

    if (isWindows()) {
        // Windows: cmd.exe /c npx approach
        var winArgs = new ArrayList<>(Arrays.asList(
            "/c", "npx", "-y", "@modelcontextprotocol/server-filesystem", "target"
        ));
        stdioParams = ServerParameters.builder("cmd.exe")
                .args(winArgs)
                .build();
    } else {
        // Linux/Mac: direct npx approach
        stdioParams = ServerParameters.builder("npx")
                .args("-y", "@modelcontextprotocol/server-filesystem", "target")
                .build();
    }

    return McpClient.sync(new StdioClientTransport(stdioParams, McpJsonDefaults.getMapper()))
            .requestTimeout(Duration.ofSeconds(10))
            .build()
            .initialize();
}

private static boolean isWindows() {
    return System.getProperty("os.name").toLowerCase().contains("win");
}
```

---

## 7. Best Practices

### 7.1 Security

#### Authentication and Authorization

```java
@Component
public class SecuredTools {

    @McpTool(name = "admin-function", description = "Admin-only function")
    public String adminFunction(
            McpSyncRequestContext context,
            @McpToolParam(description = "Data", required = true) String data) {

        // Extract authorization from transport context
        McpTransportContext transportContext = context.transportContext();
        String auth = (String) transportContext.get("authorization");

        if (!isValidToken(auth)) {
            throw new SecurityException("Invalid authorization");
        }

        if (!hasAdminRole(auth)) {
            throw new SecurityException("Insufficient permissions");
        }

        return performAdminOperation(data);
    }

    private boolean isValidToken(String token) {
        // Validate JWT or API key
        return token != null && token.startsWith("Bearer ");
    }

    private boolean hasAdminRole(String auth) {
        // Check role from token/session
        return true; // Implementation depends on auth scheme
    }
}
```

#### Input Validation

```java
@Component
public class ValidatedTools {

    @McpTool(name = "search", description = "Search records")
    public SearchResult search(
            @McpToolParam(description = "Search query", required = true) String query,
            @McpToolParam(description = "Max results", required = false) Integer limit) {

        // Validate query
        if (query == null || query.trim().isEmpty()) {
            throw new IllegalArgumentException("Query cannot be empty");
        }

        if (query.length() > 500) {
            throw new IllegalArgumentException("Query too long (max 500 characters)");
        }

        // Set sensible defaults
        int maxResults = limit != null ? Math.min(limit, 100) : 20;

        return searchService.search(query.trim(), maxResults);
    }
}
```

#### Rate Limiting

```java
@Component
public class RateLimitedTools {

    private final RateLimiter rateLimiter = RateLimiter.create(100.0); // 100 requests/sec

    @McpTool(name = "expensive-operation", description = "Resource-intensive operation")
    public CallToolResult expensiveOperation(
            McpTransportContext context,
            @McpToolParam(description = "Operation type", required = true) String type) {

        if (!rateLimiter.tryAcquire()) {
            return CallToolResult.builder()
                .isError(true)
                .addTextContent("Rate limit exceeded. Please try again later.")
                .build();
        }

        try {
            return CallToolResult.builder()
                .addTextContent(performOperation(type))
                .build();
        } catch (Exception e) {
            return CallToolResult.builder()
                .isError(true)
                .addTextContent("Operation failed: " + e.getMessage())
                .build();
        }
    }
}
```

### 7.2 Error Handling

#### Structured Error Responses

```java
@Component
public class RobustTools {

    @McpTool(name = "process-data", description = "Process data with error handling")
    public CallToolResult processData(
            @McpToolParam(description = "Data to process", required = true) String data,
            @McpToolParam(description = "Processing mode", required = false) String mode) {

        try {
            // Validate input
            if (!isValidData(data)) {
                return CallToolResult.builder()
                    .isError(true)
                    .addTextContent("Invalid data format")
                    .structuredContent(Map.of(
                        "error", "INVALID_FORMAT",
                        "details", "Data must be valid JSON"
                    ))
                    .build();
            }

            // Process
            Object result = processingService.process(data, mode);

            return CallToolResult.builder()
                .addTextContent("Processing complete")
                .structuredContent(Map.of(
                    "success", true,
                    "result", result
                ))
                .build();

        } catch (ValidationException e) {
            return CallToolResult.builder()
                .isError(true)
                .addTextContent("Validation failed: " + e.getMessage())
                .structuredContent(Map.of(
                    "error", "VALIDATION_ERROR",
                    "details", e.getErrors()
                ))
                .build();

        } catch (ExternalServiceException e) {
            return CallToolResult.builder()
                .isError(true)
                .addTextContent("External service unavailable")
                .structuredContent(Map.of(
                    "error", "SERVICE_UNAVAILABLE",
                    "retryAfter", e.getRetryAfter()
                ))
                .build();

        } catch (Exception e) {
            // Log unexpected errors but don't expose details
            logger.error("Unexpected error in process-data", e);

            return CallToolResult.builder()
                .isError(true)
                .addTextContent("An unexpected error occurred")
                .structuredContent(Map.of(
                    "error", "INTERNAL_ERROR",
                    "referenceId", UUID.randomUUID().toString()
                ))
                .build();
        }
    }
}
```

### 7.3 Performance

#### Async Processing for Long Operations

```java
@Component
public class AsyncTools {

    @McpTool(name = "generate-report", description = "Generate complex report")
    public Mono<CallToolResult> generateReport(
            McpAsyncRequestContext context,
            @McpToolParam(description = "Report type", required = true) String reportType,
            @McpToolParam(description = "Date range", required = true) String dateRange) {

        return Mono.fromCallable(() -> validateRequest(reportType, dateRange))
            .flatMap(valid -> {
                if (!valid) {
                    return Mono.just(CallToolResult.builder()
                        .isError(true)
                        .addTextContent("Invalid request parameters")
                        .build());
                }

                // Send initial progress
                return context.progress(p -> p
                    .progress(0.0)
                    .total(1.0)
                    .message("Starting report generation"))
                    .then(executeReportGeneration(reportType, dateRange, context));
            });
    }

    private Mono<CallToolResult> executeReportGeneration(
            String reportType, String dateRange, McpAsyncRequestContext context) {

        return Flux.range(0, 10)
            .flatMap(step -> {
                // Simulate processing steps
                return Mono.delay(Duration.ofMillis(200))
                    .then(context.progress(p -> p
                        .progress((step + 1) / 10.0)
                        .total(1.0)
                        .message("Processing step " + (step + 1) + "/10")));
            })
            .then(Mono.fromCallable(() -> {
                Report report = reportService.generate(reportType, dateRange);
                return CallToolResult.builder()
                    .addTextContent("Report generated successfully")
                    .structuredContent(Map.of(
                        "reportId", report.getId(),
                        "downloadUrl", report.getDownloadUrl()
                    ))
                    .build();
            }))
            .onErrorResume(e -> Mono.just(CallToolResult.builder()
                .isError(true)
                .addTextContent("Report generation failed: " + e.getMessage())
                .build()));
    }
}
```

#### Connection Pooling

```yaml
spring:
  ai:
    mcp:
      client:
        type: SYNC
        streamable-http:
          connections:
            server1:
              url: http://localhost:8080
              # Connection pool settings
              maxConnections: 50
              connectionTimeout: 5s
              readTimeout: 30s
```

### 7.4 Observability

#### Logging Integration

```java
@Component
public class ObservableTools {

    private final Logger logger = LoggerFactory.getLogger(ObservableTools.class);

    @McpTool(name = "process-transaction", description = "Process financial transaction")
    public CallToolResult processTransaction(
            McpSyncRequestContext context,
            @McpToolParam(description = "Transaction ID", required = true) String transactionId,
            @McpToolParam(description = "Amount", required = true) BigDecimal amount) {

        // Log entry
        logger.info("Processing transaction: id={}, amount={}", transactionId, amount);
        context.info("Starting transaction processing");

        try {
            var result = transactionService.process(transactionId, amount);

            logger.info("Transaction completed: id={}, status={}",
                transactionId, result.getStatus());
            context.info("Transaction completed successfully");

            return CallToolResult.builder()
                .addTextContent("Transaction processed: " + result.getStatus())
                .structuredContent(Map.of(
                    "transactionId", result.getId(),
                    "status", result.getStatus().name(),
                    "processedAt", Instant.now().toString()
                ))
                .build();

        } catch (Exception e) {
            logger.error("Transaction failed: id={}, error={}",
                transactionId, e.getMessage());
            context.progress(p -> p
                .progress(1.0)
                .total(1.0)
                .message("Transaction failed: " + e.getMessage()));

            throw e;
        }
    }
}
```

### 7.5 Testing

#### Unit Testing MCP Tools

```java
@ExtendWith(MockitoExtension.class)
class CalculatorToolsTest {

    @Mock
    private CalculatorService calculatorService;

    @InjectMocks
    private CalculatorTools calculatorTools;

    @Test
    void shouldAddTwoNumbers() {
        // Given
        when(calculatorService.add(5.0, 3.0)).thenReturn(8.0);

        // When
        double result = calculatorTools.add(5.0, 3.0);

        // Then
        assertThat(result).isEqualTo(8.0);
        verify(calculatorService).add(5.0, 3.0);
    }

    @Test
    void shouldThrowExceptionOnDivisionByZero() {
        assertThatThrownBy(() -> calculatorTools.divide(10.0, 0.0))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Division by zero");
    }

    @Test
    void shouldMultiplyNegativeNumbers() {
        // Given
        when(calculatorService.multiply(-4.0, 3.0)).thenReturn(-12.0);

        // When
        double result = calculatorTools.multiply(-4.0, 3.0);

        // Then
        assertThat(result).isEqualTo(-12.0);
    }
}
```

#### Integration Testing

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class McpServerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldExposeToolsViaMcpProtocol() throws Exception {
        // Test tool discovery
        mockMvc.perform(get("/mcp"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.tools").isArray());

        // Test tool invocation
        mockMvc.perform(post("/mcp")
                .contentType("application/json")
                .content("""
                    {
                        "jsonrpc": "2.0",
                        "method": "tools/call",
                        "params": {
                            "name": "add",
                            "arguments": {"a": 5, "b": 3}
                        }
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.result.content[0].text").value("8"));
    }
}
```

---

## Additional Resources

- [Spring AI MCP Overview](https://docs.spring.io/spring-ai/reference/2.0/api/mcp/mcp-overview.html)
- [Getting Started with MCP](https://docs.spring.io/spring-ai/reference/2.0/guides/getting-started-mcp.html)
- [MCP Server Boot Starter](https://docs.spring.io/spring-ai/reference/2.0/api/mcp/mcp-server-boot-starter-docs.html)
- [MCP Server Annotations](https://docs.spring.io/spring-ai/reference/2.0/api/mcp/mcp-annotations-server.html)
- [MCP Annotations Examples](https://docs.spring.io/spring-ai/reference/2.0/api/mcp/mcp-annotations-examples.html)
- [MCP Client Boot Starter](https://docs.spring.io/spring-ai/reference/2.0/api/mcp/mcp-client-boot-starter-docs.html)
- [Official MCP Java SDK](https://github.com/modelcontextprotocol/java-sdk)
- [Spring AI Examples Repository](https://github.com/spring-projects/spring-ai/tree/main/models/spring-ai-openai/src/test/java/org/springframework/ai/mcp)

---

## Appendix A: Annotation Reference

### Server Annotations

| Annotation          | Target    | Attributes                        |
| ------------------- | --------- | --------------------------------- |
| `@McpTool`          | Method    | `name`, `description`             |
| `@McpToolParam`     | Parameter | `name`, `description`, `required` |
| `@McpResource`      | Method    | `uri`, `name`, `description`      |
| `@McpPrompt`        | Method    | `name`, `description`             |
| `@McpArg`           | Parameter | `name`, `required`                |
| `@McpComplete`      | Method    | `prompt`                          |
| `@McpProgressToken` | Parameter | -                                 |

### Client Annotations

| Annotation                | Target | Attributes |
| ------------------------- | ------ | ---------- |
| `@McpLogging`             | Method | `clients`  |
| `@McpSampling`            | Method | `clients`  |
| `@McpProgress`            | Method | `clients`  |
| `@McpElicitation`         | Method | `clients`  |
| `@McpToolListChanged`     | Method | `clients`  |
| `@McpResourceListChanged` | Method | `clients`  |
| `@McpSampling`            | Method | `clients`  |

---

## Appendix B: Transport Classes Reference

### Server Transports

| Class                                      | Package                                               | Protocol        |
| ------------------------------------------ | ----------------------------------------------------- | --------------- |
| `WebMvcSseServerTransportProvider`         | `org.springframework.ai.mcp.server.webmvc.transport`  | SSE             |
| `WebMvcStreamableServerTransportProvider`  | `org.springframework.ai.mcp.server.webmvc.transport`  | Streamable-HTTP |
| `WebMvcStatelessServerTransport`           | `org.springframework.ai.mcp.server.webmvc.transport`  | Stateless       |
| `WebFluxSseServerTransportProvider`        | `org.springframework.ai.mcp.server.webflux.transport` | SSE             |
| `WebFluxStreamableServerTransportProvider` | `org.springframework.ai.mcp.server.webflux.transport` | Streamable-HTTP |
| `WebFluxStatelessServerTransport`          | `org.springframework.ai.mcp.server.webflux.transport` | Stateless       |

### Client Transports

| Class                              | Package                                               | Protocol        |
| ---------------------------------- | ----------------------------------------------------- | --------------- |
| `StdioClientTransport`             | `org.springframework.ai.mcp.client.stdio`             | STDIO           |
| `WebFluxSseClientTransport`        | `org.springframework.ai.mcp.client.webflux.transport` | SSE             |
| `WebClientStreamableHttpTransport` | `org.springframework.ai.mcp.client.webflux.transport` | Streamable-HTTP |
