# Spring AI 2.0 Tool Calling Reference

> **Spring AI 2.0.0-RC1** · Updated: June 2026 · Based on [Official Documentation](https://docs.spring.io/spring-ai/reference/api/tools.html)

---

## Table of Contents

1. [Overview](#1-overview)
2. [@Tool Annotation](#2-tool-annotation)
3. [ToolCallback](#3-toolcallback)
4. [ToolCallingAdvisor](#4-toolcallingadvisor)
5. [Custom ToolCallingManager](#5-custom-toolcallingmanager)
6. [User-Controlled vs Auto Tool Execution](#6-user-controlled-vs-auto-tool-execution)
7. [Best Practices](#7-best-practices)
8. [Error Handling](#8-error-handling)
9. [Streaming with Tools](#9-streaming-with-tools)
10. [Multiple Tools](#10-multiple-tools)

---

## 1. Overview

### What is Tool Calling?

Tool Calling (also known as **Function Calling**) is a pattern that allows AI models to interact with external APIs or tools, augmenting their capabilities beyond static knowledge.

```
┌─────────────┐     Tool Definition      ┌─────────────┐
│   Model     │ ◄───────────────────── │   Client    │
│             │                         │  Application│
│  Decides    │     Tool Call Request   │             │
│  to call    │ ──────────────────────► │  Executes   │
│             │                         │  the Tool   │
│  Generates  │     Tool Result         │             │
│  Response   │ ◄───────────────────── │  Returns    │
└─────────────┘                         └─────────────┘
```

### Two Primary Use Cases

| Category                  | Description                                 | Examples                                      |
| ------------------------- | ------------------------------------------- | --------------------------------------------- |
| **Information Retrieval** | Augment model knowledge with real-time data | Weather, stock prices, database queries       |
| **Taking Action**         | Execute operations in external systems      | Send email, create records, trigger workflows |

### Spring AI 2.0 Key Changes

> **Important**: Spring AI 2.0 removed implicit tool resolution via bean names. Tools must now be explicitly registered as `ToolCallback` beans and passed via `.tools()`.

```bash
# Removed in 2.0
❌ toolNames() API
❌ SpringBeanToolCallbackResolver
❌ internalToolExecutionEnabled (on ChatModel)

# New in 2.0
✅ Explicit ToolCallback beans via .tools()
✅ ToolCallingAdvisor for advisor-chain execution
✅ ToolSearchToolCallingAdvisor for on-demand discovery
```

---

## 2. @Tool Annotation

### Basic Usage

Mark methods with `@Tool` to expose them as callable tools:

```java
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.context.i18n.LocaleContextHolder;
import java.time.LocalDateTime;

class DateTimeTools {

    @Tool(description = "Get the current date and time in the user's timezone")
    String getCurrentDateTime() {
        return LocalDateTime.now()
            .atZone(LocaleContextHolder.getTimeZone().toZoneId())
            .toString();
    }
}
```

### @Tool Attributes

| Attribute         | Description                                    | Default                          |
| ----------------- | ---------------------------------------------- | -------------------------------- |
| `name`            | Tool name (used by model to identify)          | Method name                      |
| `description`     | Human-readable description for the model       | Method name                      |
| `returnDirect`    | Return result directly to client, bypass model | `false`                          |
| `resultConverter` | Custom `ToolCallResultConverter` class         | `DefaultToolCallResultConverter` |

### Tool Parameters with @ToolParam

```java
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;

class WeatherTools {

    @Tool(description = "Get weather for a specific location")
    String getWeather(
            @ToolParam(description = "City name (e.g., London, Tokyo)") String city,
            @ToolParam(description = "Temperature unit: C or F", required = false) String unit) {
        // Implementation
    }
}
```

### Parameter Annotations

| Annotation                        | Purpose                              |
| --------------------------------- | ------------------------------------ |
| `@ToolParam(description = "...")` | Describe the parameter for the model |
| `@ToolParam(required = false)`    | Mark parameter as optional           |
| `@Nullable`                       | Auto-mark as optional                |

### Using Jackson Annotations

```java
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;

record WeatherRequest(
        @JsonPropertyDescription("City name")
        String city,

        @JsonProperty(required = false)
        String unit
) {}
```

### Adding Tools to ChatClient

```java
ChatClient.create(chatModel)
    .prompt("What's the weather like in London?")
    .tools(new DateTimeTools())          // Declarative: pass instance
    .call()
    .content();

// Or use ToolCallbacks utility for explicit control
ToolCallback[] callbacks = ToolCallbacks.from(new DateTimeTools());
```

### Default Tools (Shared Across Requests)

```java
ChatClient chatClient = ChatClient.builder(chatModel)
    .defaultTools(new DateTimeTools())  // Available for ALL requests
    .build();
```

---

## 3. ToolCallback

### Interface Definition

`ToolCallback` is the core interface for defining tools:

```java
public interface ToolCallback {

    /**
     * Definition used by the AI model to determine when and how to call the tool.
     */
    ToolDefinition getToolDefinition();

    /**
     * Metadata providing additional information on handling the tool.
     */
    ToolMetadata getToolMetadata();

    /**
     * Execute tool with given input.
     */
    String call(String toolInput);

    /**
     * Execute tool with input and context.
     */
    String call(String toolInput, ToolContext toolContext);
}
```

### ToolDefinition Interface

```java
public interface ToolDefinition {
    String name();           // Unique tool identifier
    String description();    // What the tool does
    String inputSchema();    // JSON schema for parameters
}
```

### MethodToolCallback (Programmatic)

Build `ToolCallback` from methods programmatically:

```java
import org.springframework.ai.tool.support.MethodToolCallback;
import org.springframework.ai.tool.definition.ToolDefinition;
import org.springframework.ai.tool.definition.ToolDefinitions;
import org.springframework.util.ReflectionUtils;

class DateTimeTools {

    String getCurrentDateTime() {
        return LocalDateTime.now().toString();
    }
}

// Build programmatically
Method method = ReflectionUtils.findMethod(DateTimeTools.class, "getCurrentDateTime");
ToolCallback toolCallback = MethodToolCallback.builder()
    .toolDefinition(ToolDefinitions.builder(method)
        .description("Get the current date and time")
        .build())
    .toolMethod(method)
    .toolObject(new DateTimeTools())
    .build();
```

### MethodToolCallback with Static Method

```java
class MathTools {

    static int add(int a, int b) {
        return a + b;
    }
}

Method method = ReflectionUtils.findMethod(MathTools.class, "add", int.class, int.class);
ToolCallback toolCallback = MethodToolCallback.builder()
    .toolDefinition(ToolDefinitions.builder(method)
        .description("Add two numbers")
        .build())
    .toolMethod(method)
    .build();  // No toolObject needed for static methods
```

### FunctionToolCallback

Wrap `Function`, `Supplier`, `Consumer`, or `BiFunction` as tools:

```java
import org.springframework.ai.tool.support.FunctionToolCallback;

// Define the service
public class WeatherService implements Function<WeatherRequest, WeatherResponse> {
    @Override
    public WeatherResponse apply(WeatherRequest request) {
        return new WeatherResponse(25.0, Unit.C);
    }
}

// Build the callback
ToolCallback weatherCallback = FunctionToolCallback
    .builder("currentWeather", new WeatherService())
    .description("Get the weather in a location")
    .inputType(WeatherRequest.class)
    .build();

// Use in ChatClient
ChatClient.create(chatModel)
    .prompt("What's the weather in Paris?")
    .toolCallbacks(weatherCallback)
    .call()
    .content();
```

### Custom ToolCallback Implementation

Implement `ToolCallback` directly for full control:

```java
public class CustomWeatherCallback implements ToolCallback {

    private final WeatherService weatherService;

    public CustomWeatherCallback(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @Override
    public ToolDefinition getToolDefinition() {
        return ToolDefinition.builder()
            .name("currentWeather")
            .description("Get weather for a city")
            .inputSchema("""
                {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string"},
                        "unit": {"type": "string", "enum": ["C", "F"]}
                    },
                    "required": ["location"]
                }
                """)
            .build();
    }

    @Override
    public ToolMetadata getToolMetadata() {
        return ToolMetadata.builder()
            .returnDirect(false)
            .build();
    }

    @Override
    public String call(String toolInput) {
        try {
            WeatherRequest request = objectMapper.readValue(toolInput, WeatherRequest.class);
            WeatherResponse response = weatherService.getWeather(request);
            return objectMapper.writeValueAsString(response);
        } catch (Exception e) {
            throw new ToolExecutionException("Weather lookup failed", e);
        }
    }

    @Override
    public String call(String toolInput, ToolContext toolContext) {
        // Access additional context (e.g., tenant ID)
        String tenantId = (String) toolContext.getContext().get("tenantId");
        // Process with tenant context
        return call(toolInput);
    }
}
```

### ToolContext for Additional Data

Pass contextual data to tools:

```java
// Client side - pass context
ChatClient.create(chatModel)
    .prompt("Get customer details")
    .tools(new CustomerTools())
    .toolContext(Map.of("tenantId", "acme-corp", "userId", "user123"))
    .call()
    .content();

// Tool side - receive context
class CustomerTools {

    @Tool(description = "Get customer information")
    Customer getCustomer(Long customerId, ToolContext toolContext) {
        String tenantId = (String) toolContext.getContext().get("tenantId");
        return customerRepository.findByTenant(customerId, tenantId);
    }
}
```

---

## 4. ToolCallingAdvisor

### Overview

`ToolCallingAdvisor` manages the tool calling loop as part of the advisor chain, providing:

- **Observability**: Other advisors can intercept tool call iterations
- **Memory Integration**: Works with Chat Memory advisors
- **Extensibility**: Customize tool calling behavior

### Basic Usage

```java
var toolCallAdvisor = ToolCallAdvisor.builder()
    .toolCallingManager(toolCallingManager)
    .advisorOrder(BaseAdvisor.HIGHEST_PRECEDENCE + 300)
    .build();

ChatClient chatClient = ChatClient.builder(chatModel)
    .defaultAdvisors(toolCallAdvisor)
    .build();

// No explicit advisor needed - auto-registered when tools present
String response = ChatClient.create(chatModel)
    .prompt("What's the weather?")
    .tools(weatherCallback)
    .call()
    .content();
```

### Configuration Options

```java
ToolCallAdvisor advisor = ToolCallAdvisor.builder()
    .toolCallingManager(toolCallingManager)     // Custom manager (optional)
    .advisorOrder(BaseAdvisor.HIGHEST_PRECEDENCE + 300)  // Execution order
    .conversationHistoryEnabled(true)            // Maintain history in loop
    .build();

// Or use convenience methods
ToolCallAdvisor.builder()
    .disableMemory()  // Let ChatMemory handle history instead
    .build();
```

### Conversation History Management

**With Internal History (Default)**:

```java
// Advisor maintains full history during tool iterations
var toolCallAdvisor = ToolCallAdvisor.builder()
    .conversationHistoryEnabled(true)  // Default
    .build();
```

**With ChatMemory Integration**:

```java
var toolCallAdvisor = ToolCallAdvisor.builder()
    .disableMemory()  // Don't maintain internal history
    .build();

var chatMemoryAdvisor = MessageChatMemoryAdvisor.builder(chatMemory)
    .advisorOrder(BaseAdvisor.HIGHEST_PRECEDENCE + 200)  // Execute BEFORE tool advisor
    .build();

ChatClient chatClient = ChatClient.builder(chatModel)
    .defaultAdvisors(chatMemoryAdvisor, toolCallAdvisor)
    .build();
```

### Return Direct with Advisor

When a tool has `returnDirect=true`, `ToolCallingAdvisor` breaks the loop and returns directly:

```java
// Tool definition with returnDirect
ToolMetadata metadata = ToolMetadata.builder()
    .returnDirect(true)
    .build();

ToolCallback ragCallback = FunctionToolCallback
    .builder("searchKnowledgeBase", knowledgeBaseService)
    .description("Search internal knowledge base")
    .inputType(SearchRequest.class)
    .toolMetadata(metadata)
    .build();

// Usage - result returns directly to client, bypassing model
ChatResponse response = ChatClient.create(chatModel)
    .prompt("Find docs about Spring AI")
    .toolCallbacks(ragCallback)
    .call()
    .content();

// response contains the RAG result directly
```

---

## 5. Custom ToolCallingManager

### Interface Definition

```java
public interface ToolCallingManager {

    /**
     * Resolve tool definitions from chat options.
     */
    List<ToolDefinition> resolveToolDefinitions(ToolCallingChatOptions chatOptions);

    /**
     * Execute tool calls requested by the model.
     */
    ToolExecutionResult executeToolCalls(Prompt prompt, ChatResponse chatResponse);
}
```

### Default Implementation

Spring Boot auto-configures `DefaultToolCallingManager`:

```java
@Bean
ToolCallingManager toolCallingManager() {
    return DefaultToolCallingManager.builder()
        .toolCallbacks(List.of())  // Optional default callbacks
        .build();
}
```

### Custom Manager with Policy Control

```java
@Bean
ToolCallingManager customToolCallingManager(
        List<ToolCallback> toolCallbacks,
        ToolExecutionExceptionProcessor exceptionProcessor) {

    return DefaultToolCallingManager.builder()
        .toolCallbacks(toolCallbacks)
        .toolExecutionExceptionProcessor(exceptionProcessor)
        .build();
}
```

### Custom Manager with Tenant Isolation

```java
@Component
class TenantAwareToolCallingManager implements ToolCallingManager {

    private final ToolCallbackResolver resolver;
    private final TenantContext tenantContext;

    @Override
    public ToolExecutionResult executeToolCalls(Prompt prompt, ChatResponse chatResponse) {
        // Check tenant permissions before execution
        String tenantId = tenantContext.getCurrentTenant();

        for (ToolCall toolCall : chatResponse.getToolCalls()) {
            validateToolAccess(toolCall.getName(), tenantId);
        }

        return DefaultToolCallingManager.builder().build()
            .executeToolCalls(prompt, chatResponse);
    }

    private void validateToolAccess(String toolName, String tenantId) {
        // Custom permission validation
        if (!permissionService.canAccessTool(tenantId, toolName)) {
            throw new ToolExecutionException(
                "Tool '%s' is not available for tenant '%s'".formatted(toolName, tenantId)
            );
        }
    }
}
```

### Custom Exception Processor

```java
@Bean
ToolExecutionExceptionProcessor customExceptionProcessor() {
    return exception -> {
        if (exception.getCause() instanceof RateLimitException) {
            // Return message to model for retry
            return "Rate limit exceeded. Please try again later.";
        }
        if (exception.getCause() instanceof SecurityException) {
            // Throw to caller for handling
            throw new RuntimeException("Security violation", exception);
        }
        // Default: return error message to model
        return "Error: " + exception.getMessage();
    };
}
```

---

## 6. User-Controlled vs Auto Tool Execution

### Pattern 1: Auto Tool Execution (Recommended)

`ToolCallingAdvisor` is automatically registered when tools are present:

```java
// Simplest approach - advisor handles everything
String response = ChatClient.create(chatModel)
    .prompt("What's the weather in London?")
    .tools(weatherCallback)  // Advisor auto-registered
    .call()
    .content();
```

### Pattern 2: Explicit Advisor Registration

```java
// Pre-configure with advisor
var toolCallAdvisor = ToolCallAdvisor.builder()
    .toolCallingManager(toolCallingManager)
    .build();

ChatClient chatClient = ChatClient.builder(chatModel)
    .defaultAdvisors(toolCallAdvisor)
    .build();

// Tools work automatically
String response = chatClient.prompt()
    .user("What's the weather?")
    .tools(weatherCallback)
    .call()
    .content();
```

### Pattern 3: User-Controlled Execution

Full control over the tool execution loop:

```java
ChatModel chatModel = ...
ToolCallingManager toolCallingManager = DefaultToolCallingManager.builder().build();

ChatOptions chatOptions = ToolCallingChatOptions.builder()
    .toolCallbacks(ToolCallbacks.from(new CustomerTools()))
    .internalToolExecutionEnabled(false)  // Disable auto-execution
    .build();

Prompt prompt = new Prompt("Get customer details", chatOptions);

// Manual loop
ChatResponse chatResponse = chatModel.call(prompt);

while (chatResponse.hasToolCalls()) {
    // Execute tools
    ToolExecutionResult result = toolCallingManager.executeToolCalls(prompt, chatResponse);

    // Continue with results
    prompt = new Prompt(result.conversationHistory(), chatOptions);
    chatResponse = chatModel.call(prompt);
}

System.out.println(chatResponse.getResult().getOutput().getText());
```

### Comparison

| Aspect        | Auto (Advisor)       | User-Controlled       |
| ------------- | -------------------- | --------------------- |
| Ease of use   | Simple, auto-handled | Manual loop required  |
| Integration   | Advisor chain aware  | Independent execution |
| Memory        | Built-in support     | Manual integration    |
| Customization | Limited              | Full control          |
| Use case      | Most applications    | Advanced scenarios    |

---

## 7. Best Practices

### Tool Descriptions

**Good descriptions help the model understand when and how to use tools:**

```java
// ❌ Bad: Too vague
@Tool(description = "Get weather")
String getWeather(String city);

// ✅ Good: Clear and detailed
@Tool(description = """
    Retrieve current weather information for a specified city.
    Returns temperature, conditions, and humidity.
    Required: city name (e.g., "London", "Tokyo", "New York")
    Optional: temperature unit (Celsius or Fahrenheit)
    """)
WeatherResult getWeather(
    @ToolParam(description = "City name, city code, or coordinates")
    String location,
    @ToolParam(description = "Temperature unit: 'C' for Celsius, 'F' for Fahrenheit", required = false)
    String unit);
```

### Parameter Schema Best Practices

```java
// Use enums for constrained values
record SearchRequest(
    @JsonPropertyDescription("Search category")
    Category category,  // Enum with fixed values

    @JsonProperty(required = false)
    @ToolParam(description = "Maximum results (1-100)")
    Integer limit
) {}

// Define enums clearly
public enum Category {
    NEWS,     // Current news articles
    PRODUCTS, // Product catalog
    USERS     // User accounts
}
```

### Return Types

```java
// ✅ Return structured data for better model understanding
@Tool(description = "Get order status")
OrderStatusResult getOrderStatus(
    @ToolParam(description = "Order ID (e.g., ORD-12345)")
    String orderId) {
    Order order = orderRepository.findByOrderId(orderId);
    return new OrderStatusResult(
        order.getStatus().name(),
        order.getStatusMessage(),
        order.getEstimatedDelivery()
    );
}

// Record for return type
public record OrderStatusResult(
    String status,
    String message,
    LocalDateTime estimatedDelivery
) {}
```

### Tool Naming Conventions

```java
// ✅ Verb-noun pattern
@Tool(name = "getWeather")           // Action + target
@Tool(name = "searchProducts")       // Action + target
@Tool(name = "createOrder")          // Action + target
@Tool(name = "calculateShipping")     // Action + target

// ❌ Avoid
@Tool(name = "weather")              // Too generic
@Tool(name = "tool1")                // Meaningless
@Tool(name = "DoSearch")             // Inconsistent casing
```

### GraalVM Native Image Support

For native image compilation, ensure tool classes are registered:

```java
// Option 1: Make it a Spring bean (auto-registered)
@Component
class DateTimeTools {
    @Tool(description = "Get current date/time")
    String getCurrentDateTime() { ... }
}

// Option 2: Manual reflection registration
@RegisterReflection(targets = DateTimeTools.class,
                    memberCategories = MemberCategory.INVOKE_DECLARED_METHODS)
class AppConfiguration { }
```

---

## 8. Error Handling

### ToolExecutionException

Throw `ToolExecutionException` from custom callbacks:

```java
public class CustomCallback implements ToolCallback {

    @Override
    public String call(String toolInput) {
        try {
            return doExecute(toolInput);
        } catch (Exception e) {
            throw new ToolExecutionException("Tool execution failed: " + e.getMessage(), e);
        }
    }
}
```

### ToolExecutionExceptionProcessor

Handle exceptions with custom logic:

```java
@FunctionalInterface
public interface ToolExecutionExceptionProcessor {
    /**
     * Process exception - return message to model OR throw to caller.
     */
    String process(ToolExecutionException exception);
}
```

### Default Behavior Configuration

```properties
# application.properties
spring.ai.tools.throw-exception-on-error=false
```

| Setting           | Behavior                                        |
| ----------------- | ----------------------------------------------- |
| `false` (default) | Send error message to model, let it retry/adapt |
| `true`            | Throw exception to caller for handling          |

### Custom Exception Handler

```java
@Bean
ToolExecutionExceptionProcessor customExceptionHandler() {
    return exception -> {
        Throwable cause = exception.getCause();

        return switch (cause) {
            case RateLimitException rle ->
                "Service temporarily unavailable (rate limit). Please wait and retry.";
            case AuthenticationException ae ->
                "Authentication failed. Please check credentials.";
            case ValidationException ve ->
                "Invalid input: " + ve.getMessage();
            case TimeoutException te ->
                "Request timed out. Please try again.";
            default -> {
                log.error("Tool execution failed", exception);
                yield "An unexpected error occurred. Please try again.";
            }
        };
    };
}
```

### Per-Tool Error Handling

```java
@Tool(name = "criticalOperation",
      resultConverter = SafeResultConverter.class)
Result criticalOperation(Parameters params) {
    // Implementation
}

// Custom converter that handles errors
public class SafeResultConverter implements ToolCallResultConverter {
    @Override
    public String convert(Object result, Type returnType) {
        if (result instanceof ErrorResult error) {
            return """
                {"error": "%s", "code": "%s", "recoverable": %b}
                """.formatted(error.message(), error.code(), error.isRecoverable());
        }
        return new DefaultToolCallResultConverter().convert(result, returnType);
    }
}
```

---

## 9. Streaming with Tools

### Basic Streaming

```java
// Simple streaming with tools
Flux<String> stream = ChatClient.create(chatModel)
    .prompt()
    .user("What's the weather in Paris, Tokyo, and New York?")
    .tools(weatherCallback)
    .stream()
    .content();

stream.subscribe(System.out::print);
```

### User-Controlled Streaming with Aggregation

When using `ChatModel` directly with streaming:

```java
ToolCallingManager toolCallingManager = DefaultToolCallingManager.builder().build();

ChatOptions options = ToolCallingChatOptions.builder()
    .toolCallbacks(weatherCallback)
    .internalToolExecutionEnabled(false)
    .build();

AtomicReference<ChatResponse> aggregatedRef = new AtomicReference<>();

// Aggregate streaming chunks
new MessageAggregator()
    .aggregate(chatModel.stream(new Prompt(userMessage, options)), aggregatedRef::set)
    .collectList()
    .block();

// Execute tool loop
while (aggregatedRef.get().hasToolCalls()) {
    ToolExecutionResult result = toolCallingManager.executeToolCalls(
        new Prompt(userMessage, options),
        aggregatedRef.get()
    );

    aggregatedRef.set(null);
    new MessageAggregator()
        .aggregate(
            chatModel.stream(new Prompt(result.conversationHistory(), options)),
            aggregatedRef::set
        )
        .collectList()
        .block();
}
```

### ToolCallAdvisor Streaming Options

```java
// Default: stream tool responses as they complete
var advisor = ToolCallAdvisor.builder()
    .streamToolCallResponses(true)  // Default
    .build();

// Suppress intermediate tool responses - only final answer
var advisor = ToolCallAdvisor.builder()
    .suppressToolCallStreaming()  // Shorthand for streamToolCallResponses(false)
    .build();
```

### Streaming with Return Direct

```java
ToolCallback searchCallback = FunctionToolCallback
    .builder("search", searchService)
    .toolMetadata(ToolMetadata.builder().returnDirect(true).build())
    .build();

ChatClient.create(chatModel)
    .prompt()
    .user("Search for Spring AI tutorials")
    .tools(searchCallback)
    .stream()
    .content()
    .subscribe(response -> {
        // Direct result returned immediately
        System.out.println(response);
    });
```

---

## 10. Multiple Tools

### Multiple Tools in One Call

```java
// Define multiple tools in one class
class AssistantTools {

    @Tool(description = "Get current weather for a city")
    WeatherResult getWeather(
        @ToolParam(description = "City name") String city) { ... }

    @Tool(description = "Search for products in catalog")
    List<Product> searchProducts(
        @ToolParam(description = "Search query") String query,
        @ToolParam(description = "Maximum results", required = false) Integer limit) { ... }

    @Tool(description = "Calculate shipping cost")
    Money calculateShipping(
        @ToolParam(description = "Destination country code") String country,
        @ToolParam(description = "Package weight in kg") double weight) { ... }
}

// Pass all tools at once
ChatClient.create(chatModel)
    .prompt("I need to ship a 5kg package to Germany. What's the weather there?")
    .tools(new AssistantTools())
    .call()
    .content();
```

### ToolCallbacks Utility

```java
// Generate explicit callbacks from object
ToolCallback[] callbacks = ToolCallbacks.from(new AssistantTools());

// Or build from multiple sources
List<ToolCallback> allTools = new ArrayList<>();
allTools.addAll(List.of(ToolCallbacks.from(new DateTimeTools())));
allTools.addAll(List.of(ToolCallbacks.from(new WeatherTools())));
allTools.addAll(List.of(ToolCallbacks.from(new OrderTools())));

ChatClient.create(chatModel)
    .prompt()
    .user("What's the weather and my order status?")
    .toolCallbacks(allTools)
    .call()
    .content();
```

### Selective Tool Registration

```java
// Different tools for different requests
public class ToolSelector {

    ToolCallback[] selectTools(String intent) {
        return switch (intent) {
            case "weather" -> ToolCallbacks.from(new WeatherTools());
            case "orders" -> ToolCallbacks.from(new OrderTools());
            case "support" -> ToolCallbacks.from(new SupportTools());
            default -> ToolCallbacks.from(new GeneralTools());
        };
    }
}

// Usage
@Service
class ChatService {

    private final ToolSelector toolSelector;

    public String chat(String userMessage) {
        String intent = classifyIntent(userMessage);
        ToolCallback[] tools = toolSelector.selectTools(intent);

        return ChatClient.create(chatModel)
            .prompt()
            .user(userMessage)
            .toolCallbacks(tools)
            .call()
            .content();
    }
}
```

### Sequential Tool Execution

The model determines execution order. Example flow:

```
User: "What's the weather in London and calculate shipping for a 3kg package to the UK?"

Model decides:
1. First call: getWeather(city="London")
2. Then call: calculateShipping(country="UK", weight=3)

Advisor executes sequentially:
  Tool 1 (getWeather) → Result
  Tool 2 (calculateShipping) → Result

Model generates final response with both results
```

### Tool Search (On-Demand Discovery)

Spring AI 2.0 introduces `ToolSearchToolCallingAdvisor` for large tool sets:

```java
// Index tools for on-demand discovery
ToolSearchToolCallingAdvisor searchAdvisor = ToolSearchToolCallingAdvisor.builder()
    .toolIndex(new VectorStoreToolIndex(vectorStore))  // Or LuceneToolIndex, RegexToolIndex
    .build();

// Only relevant tools are loaded based on user intent
ChatClient chatClient = ChatClient.builder(chatModel)
    .defaultAdvisors(searchAdvisor)  // Dynamically discovers tools
    .build();
```

### Tool Argument Augmentation

Add extra metadata to tool calls:

```java
// Define augmentation record
public record AgentThinking(
    @ToolParam(description = "Reasoning before calling tool", required = true)
    String innerThought,

    @ToolParam(description = "Confidence: low, medium, high", required = false)
    String confidence
) {}

// Create augmented provider
AugmentedToolCallbackProvider<AgentThinking> provider =
    AugmentedToolCallbackProvider.<AgentThinking>builder()
        .toolObject(new MyTools())
        .argumentType(AgentThinking.class)
        .argumentConsumer(event -> {
            // Log reasoning for observability
            log.info("Tool: {} | Thought: {} | Confidence: {}",
                event.toolDefinition().name(),
                event.arguments().innerThought(),
                event.arguments().confidence());
        })
        .removeExtraArgumentsAfterProcessing(true)  // Don't pass to actual tool
        .build();

// Use with ChatClient
ChatClient.create(chatModel)
    .defaultToolCallbacks(provider)
    .build();
```

---

## Quick Reference

### Dependency Setup

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
</dependency>
```

### Minimal Configuration

```properties
spring.ai.openai.api-key=${OPENAI_API_KEY}
spring.ai.openai.chat.options.model=gpt-4o
```

### Complete Example

```java
@Service
class WeatherChatService {

    private final ChatClient chatClient;

    public WeatherChatService(ChatClient.Builder builder, ChatModel chatModel) {
        this.chatClient = builder
            .defaultTools(new WeatherTools())
            .build();
    }

    public String ask(String question) {
        return chatClient.prompt()
            .user(question)
            .tools(new WeatherTools())
            .call()
            .content();
    }
}

// Tool class
@Component
class WeatherTools {

    @Tool(description = "Get current weather for a city")
    String getWeather(
        @ToolParam(description = "City name") String city) {
        return "25°C, sunny";
    }
}
```

### Key Interfaces Summary

| Interface                         | Purpose                              |
| --------------------------------- | ------------------------------------ |
| `ToolCallback`                    | Define tool definition and execution |
| `ToolDefinition`                  | Tool name, description, input schema |
| `ToolMetadata`                    | Return direct, result converter      |
| `ToolCallingManager`              | Execute tool calls, manage lifecycle |
| `ToolCallingAdvisor`              | Advisor-chain tool execution         |
| `ToolContext`                     | Pass contextual data to tools        |
| `ToolExecutionExceptionProcessor` | Handle execution errors              |

### Property Reference

```properties
# Error handling
spring.ai.tools.throw-exception-on-error=false

# Model options (provider-specific)
spring.ai.openai.chat.options.model=gpt-4o
spring.ai.openai.chat.options.temperature=0.7
```

---

## References

- [Spring AI Tool Calling Documentation](https://docs.spring.io/spring-ai/reference/api/tools.html)
- [Spring AI 2.0.0-RC1 Release Notes](https://spring.io/blog/2026/06/06/spring-ai-2-0-0-RC1-available-now)
- [Recursive Advisors](https://docs.spring.io/spring-ai/reference/api/advisors-recursive.html)
