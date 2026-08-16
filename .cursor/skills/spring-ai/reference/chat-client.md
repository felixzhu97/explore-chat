# ChatClient API Reference

> Spring AI 2.0 Official Documentation

The `ChatClient` offers a fluent API for communicating with an AI Model. It supports both a synchronous and streaming programming model.

The fluent API has methods for building up the constituent parts of a `Prompt` that is passed to the AI model as input. The `Prompt` contains the instructional text to guide the AI model's output and behavior. From the API point of view, prompts consist of a collection of messages.

---

## Table of Contents

1. [Creating ChatClient](#1-creating-chatclient)
2. [Fluent API](#2-fluent-api)
3. [Response Types](#3-response-types)
4. [Prompt Templates](#4-prompt-templates)
5. [Defaults](#5-defaults)
6. [Advisors](#6-advisors)
7. [Chat Memory](#7-chat-memory)
8. [Multi-Model Configuration](#8-multi-model-configuration)
9. [Metadata](#9-metadata)

---

## 1. Creating ChatClient

The `ChatClient` is created using a `ChatClient.Builder` object. You can obtain an autoconfigured `ChatClient.Builder` instance for any ChatModel Spring Boot autoconfiguration or create one programmatically.

### 1.1 Using Autoconfigured Builder

In the most simple use case, Spring AI provides Spring Boot autoconfiguration, creating a prototype `ChatClient.Builder` bean for you to inject into your class.

```java
@RestController
class MyController {

    private final ChatClient chatClient;

    public MyController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @GetMapping("/ai")
    String generation(String userInput) {
        return this.chatClient.prompt()
            .user(userInput)
            .call()
            .content();
    }
}
```

### 1.2 Multiple ChatClients with Same Model Type

When you need multiple ChatClient instances with the same model but different configurations:

```java
@Configuration
class ChatClientConfig {

    @Bean
    ChatClient defaultChatClient(ChatClient.Builder builder) {
        return builder.build();
    }

    @Bean
    ChatClient customChatClient(ChatClient.Builder builder) {
        return builder.defaultSystem("You are a helpful assistant.").build();
    }
}
```

### 1.3 ChatClients for Different Model Types

When working with multiple AI models, use `ChatClientBuilderConfigurer` to retain observability and customizers:

```java
@Configuration
public class ChatClientConfig {

    @Bean
    @Primary
    public ChatClient openAiChatClient(OpenAiChatModel chatModel,
            ChatClientBuilderConfigurer configurer,
            ObjectProvider<ObservationRegistry> observationRegistry,
            ObjectProvider<ChatClientObservationConvention> chatClientObservationConvention,
            ObjectProvider<AdvisorObservationConvention> advisorObservationConvention,
            ObjectProvider<ToolCallingAdvisor.Builder<?>> toolCallingAdvisorBuilder) {
        return buildChatClient(chatModel, configurer, observationRegistry,
                chatClientObservationConvention, advisorObservationConvention,
                toolCallingAdvisorBuilder);
    }

    @Bean
    public ChatClient anthropicChatClient(AnthropicChatModel chatModel,
            ChatClientBuilderConfigurer configurer,
            ObjectProvider<ObservationRegistry> observationRegistry,
            ObjectProvider<ChatClientObservationConvention> chatClientObservationConvention,
            ObjectProvider<AdvisorObservationConvention> advisorObservationConvention,
            ObjectProvider<ToolCallingAdvisor.Builder<?>> toolCallingAdvisorBuilder) {
        return buildChatClient(chatModel, configurer, observationRegistry,
                chatClientObservationConvention, advisorObservationConvention,
                toolCallingAdvisorBuilder);
    }

    private ChatClient buildChatClient(ChatModel chatModel,
            ChatClientBuilderConfigurer configurer,
            ObjectProvider<ObservationRegistry> observationRegistry,
            ObjectProvider<ChatClientObservationConvention> chatClientObservationConvention,
            ObjectProvider<AdvisorObservationConvention> advisorObservationConvention,
            ObjectProvider<ToolCallingAdvisor.Builder<?>> toolCallingAdvisorBuilder) {
        ChatClient.Builder builder = ChatClient.builder(chatModel,
                observationRegistry.getIfUnique(() -> ObservationRegistry.NOOP),
                chatClientObservationConvention.getIfUnique(),
                advisorObservationConvention.getIfUnique(),
                toolCallingAdvisorBuilder.getIfAvailable());
        return configurer.configure(builder).build();
    }
}
```

### 1.4 Multiple OpenAI-Compatible API Endpoints

```java
@Service
public class MultiModelService {

    public void multiClientFlow() {
        // Create a new OpenAiChatModel for Groq (Llama3)
        OpenAiChatModel groqModel = OpenAiChatModel.builder()
            .options(OpenAiChatOptions.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .apiKey(System.getenv("GROQ_API_KEY"))
                .model("llama3-70b-8192")
                .temperature(0.5)
                .build())
            .build();

        // Create a new OpenAiChatModel for GPT-4
        OpenAiChatModel gpt4Model = OpenAiChatModel.builder()
            .options(OpenAiChatOptions.builder()
                .baseUrl("https://api.openai.com")
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .model("gpt-4")
                .temperature(0.7)
                .build())
            .build();

        String groqResponse = ChatClient.builder(groqModel).build()
            .prompt("What is the capital of France?").call().content();
        String gpt4Response = ChatClient.builder(gpt4Model).build()
            .prompt("What is the capital of France?").call().content();
    }
}
```

---

## 2. Fluent API

The `ChatClient` fluent API allows you to create a prompt in three distinct ways using an overloaded `prompt` method:

### 2.1 Prompt Initiation Methods

| Method                   | Description                                                     |
| ------------------------ | --------------------------------------------------------------- |
| `prompt()`               | Start with no arguments, build up user, system, and other parts |
| `prompt(Prompt prompt)`  | Accept an existing `Prompt` instance                            |
| `prompt(String content)` | Convenience method with user text content                       |

### 2.2 Basic Usage

```java
// Empty prompt - build step by step
chatClient.prompt()
    .user("Hello")
    .system("You are a helpful assistant")
    .call()
    .content();

// Direct string prompt (creates user message)
chatClient.prompt("Hello").call().content();

// With existing Prompt object
Prompt customPrompt = new Prompt(List.of(new UserMessage("Hello")));
chatClient.prompt(customPrompt).call().content();
```

### 2.3 Message Methods

| Method                        | Description                 |
| ----------------------------- | --------------------------- |
| `.user(String/Consumer)`      | Add user message(s)         |
| `.system(String/Consumer)`    | Add system message(s)       |
| `.messages(List<Message>)`    | Add multiple messages       |
| `.options(ChatOptions)`       | Set model options           |
| `.tools(Object...)`           | Register tools for the call |
| `.advisors(Advisor/Consumer)` | Add advisors                |

### 2.4 call() vs stream()

```java
// Synchronous call
String content = chatClient.prompt()
    .user("Tell me a joke")
    .call()
    .content();

// Streaming call (returns Flux)
Flux<String> stream = chatClient.prompt()
    .user("Tell me a story")
    .stream()
    .content();
```

---

## 3. Response Types

The `ChatClient` API offers several ways to format the response from the AI Model.

### 3.1 content() - String Response

```java
String response = chatClient.prompt()
    .user("Tell me a joke")
    .call()
    .content();
```

### 3.2 chatResponse() - Full Response with Metadata

Returns a `ChatResponse` object containing multiple generations and metadata (e.g., token usage).

```java
ChatResponse chatResponse = chatClient.prompt()
    .user("Tell me a joke")
    .call()
    .chatResponse();
```

### 3.3 entity() - Map to Java Type

Maps the AI model's output to a Java entity class.

```java
// Simple record
record ActorFilms(String actor, List<String> movies) {}

ActorFilms actorFilms = chatClient.prompt()
    .user("Generate the filmography for a random actor.")
    .call()
    .entity(ActorFilms.class);

// List of entities
List<ActorFilms> actorFilms = chatClient.prompt()
    .user("Generate the filmography of 5 movies for Tom Hanks and Bill Murray.")
    .call()
    .entity(new ParameterizedTypeReference<List<ActorFilms>>() {});
```

### 3.4 responseEntity() - Both Response and Entity

Returns both the `ChatResponse` and the mapped entity.

```java
ResponseEntity<ActorFilms> response = chatClient.prompt()
    .user("Generate the filmography for Tom Hanks.")
    .call()
    .responseEntity(ActorFilms.class);

// Access both
ChatResponse chatResponse = response.getBody().getChatResponse();
ActorFilms actorFilms = response.getBody().getEntity();
```

### 3.5 EntityParamSpec - Structured Output Options

#### Provider-Native Structured Output

```java
ActorFilms actorFilms = chatClient.prompt()
    .user("Generate the filmography for a random actor.")
    .call()
    .entity(ActorFilms.class, spec -> spec.useProviderStructuredOutput());
```

#### Schema Validation with Retry

```java
ActorFilms actorFilms = chatClient.prompt()
    .user("Generate the filmography for a random actor.")
    .call()
    .entity(ActorFilms.class, spec -> spec.validateSchema());

// Combined options
ActorFilms actorFilms = chatClient.prompt()
    .user("Generate the filmography for a random actor.")
    .call()
    .entity(ActorFilms.class, spec -> spec
        .useProviderStructuredOutput()
        .validateSchema());
```

### 3.6 stream() Return Values

```java
// Flux of String content
Flux<String> content = chatClient.prompt()
    .user("Tell me a story")
    .stream()
    .content();

// Flux of ChatResponse
Flux<ChatResponse> chatResponse = chatClient.prompt()
    .user("Tell me a story")
    .stream()
    .chatResponse();
```

### 3.7 Summary of call() Return Methods

| Method                                       | Return Type          |
| -------------------------------------------- | -------------------- |
| `content()`                                  | `String`             |
| `chatResponse()`                             | `ChatResponse`       |
| `chatClientResponse()`                       | `ChatClientResponse` |
| `entity(Class)`                              | `T`                  |
| `entity(ParameterizedTypeReference)`         | `T`                  |
| `entity(Class, Consumer)`                    | `T`                  |
| `responseEntity(Class)`                      | `ResponseEntity<T>`  |
| `responseEntity(ParameterizedTypeReference)` | `ResponseEntity<T>`  |

---

## 4. Prompt Templates

The ChatClient fluent API lets you provide user and system text as templates with variables that are replaced at runtime.

### 4.1 Basic Template Variables

```java
String answer = ChatClient.create(chatModel).prompt()
    .user(u -> u
            .text("Tell me the names of 5 movies whose soundtrack was composed by {composer}")
            .param("composer", "John Williams"))
    .call()
    .content();
```

### 4.2 Multiple Parameters

```java
String answer = chatClient.prompt()
    .user(u -> u
            .text("Generate a {genre} movie about {topic}")
            .param("genre", "sci-fi")
            .param("topic", "space exploration"))
    .call()
    .content();
```

### 4.3 System Message Templates

```java
String response = chatClient.prompt()
    .system(s -> s
            .text("You are a {role} assistant specialized in {topic}")
            .param("role", "technical")
            .param("topic", "programming"))
    .user("Explain closures in JavaScript")
    .call()
    .content();
```

### 4.4 Custom Template Renderer

By default, Spring AI uses `StTemplateRenderer` with `{}` delimiters. You can customize the delimiters:

```java
String answer = ChatClient.create(chatModel).prompt()
    .user(u -> u
            .text("Tell me about <subject>")
            .param("subject", "AI"))
    .templateRenderer(StTemplateRenderer.builder()
            .startDelimiterToken('<')
            .endDelimiterToken('>')
            .build())
    .call()
    .content();
```

### 4.5 NoOp Template Renderer

For cases where no template processing is desired:

```java
// Disables template processing - {variable} won't be replaced
ChatClient.create(chatModel).prompt()
    .user(u -> u
            .text("Tell me about {topic}")
            .param("topic", "AI"))  // Won't be replaced
    .templateRenderer(NoOpTemplateRenderer.INSTANCE)
    .call()
    .content();
```

---

## 5. Defaults

Creating a `ChatClient` with default system text simplifies runtime code by eliminating the need to set system text for each request.

### 5.1 Default System Text

```java
@Configuration
class Config {

    @Bean
    ChatClient chatClient(ChatClient.Builder builder) {
        return builder
            .defaultSystem("You are a friendly chat bot that answers in the voice of a Pirate")
            .build();
    }
}
```

```java
@RestController
class AIController {

    private final ChatClient chatClient;

    AIController(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @GetMapping("/ai/simple")
    public Map<String, String> completion(
            @RequestParam(value = "message", defaultValue = "Tell me a joke") String message) {
        return Map.of("completion", this.chatClient.prompt().user(message).call().content());
    }
}
```

### 5.2 Default System Text with Parameters

```java
@Configuration
class Config {

    @Bean
    ChatClient chatClient(ChatClient.Builder builder) {
        return builder
            .defaultSystem("You are a friendly chat bot that answers in the voice of a {voice}")
            .build();
    }
}
```

```java
@RestController
class AIController {

    private final ChatClient chatClient;

    AIController(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @GetMapping("/ai")
    Map<String, String> completion(String message, String voice) {
        return Map.of("completion",
            this.chatClient.prompt()
                .system(sp -> sp.param("voice", voice))
                .user(message)
                .call()
                .content());
    }
}
```

### 5.3 Other Default Configuration

| Method                                      | Description                              |
| ------------------------------------------- | ---------------------------------------- |
| `defaultSystem(String/Resource/Consumer)`   | Default system message                   |
| `defaultUser(String/Resource/Consumer)`     | Default user message                     |
| `defaultOptions(ChatOptions)`               | Default model options                    |
| `defaultTools(Object...)`                   | Default tools available to every request |
| `defaultToolContext(Map)`                   | Default context for tool executions      |
| `defaultTemplateRenderer(TemplateRenderer)` | Default template renderer                |
| `defaultAdvisors(Advisor...)`               | Default advisors                         |

### 5.4 Runtime Override

Defaults can be overridden at runtime using corresponding methods without the `default` prefix:

```java
// Default: builder.defaultSystem("You are helpful")
// Runtime override:
chatClient.prompt()
    .system("You are a pirate")  // Overrides default
    .user("Hello")
    .call()
    .content();
```

---

## 6. Advisors

The Advisors API provides a flexible way to intercept, modify, and enhance AI-driven interactions.

### 6.1 AdvisorSpec Interface

```java
interface AdvisorSpec {
    AdvisorSpec param(String k, Object v);
    AdvisorSpec params(Map<String, Object> p);
    AdvisorSpec advisors(Advisor... advisors);
    AdvisorSpec advisors(List<Advisor> advisors);
}
```

### 6.2 SimpleLoggerAdvisor

Logs request and response data for debugging:

```java
ChatResponse response = ChatClient.create(chatModel).prompt()
    .advisors(new SimpleLoggerAdvisor())
    .user("Tell me a joke?")
    .call()
    .chatResponse();
```

Enable DEBUG logging:

```yaml
logging:
  level:
    org.springframework.ai.chat.client.advisor: DEBUG
```

Custom logger:

```java
SimpleLoggerAdvisor customLogger = new SimpleLoggerAdvisor(
    request -> "Custom request: " + request.prompt().getUserMessage(),
    response -> "Custom response: " + response.getResult(),
    0  // order
);
```

### 6.3 ToolCallingAdvisor

The `ChatClient` always auto-registers a `ToolCallingAdvisor` in the advisor chain unless auto-registration is explicitly disabled.

```java
String response = ChatClient.builder(chatModel)
    .build()
    .prompt("What day is tomorrow?")
    .tools(new DateTimeTools())
    .call()
    .content();
```

#### Disabling Auto-Registration

**Globally:**

```yaml
spring:
  ai:
    chat:
      client:
        tool-calling:
          enabled: false
```

**Per Call:**

```java
chatClient.prompt("What day is tomorrow?")
    .tools(new DateTimeTools())
    .advisors(AdvisorParams.toolCallingAdvisorAutoRegister(false))
    .call()
    .content();
```

### 6.4 Combining Multiple Advisors

The order of advisors matters:

```java
ChatClient.builder(chatModel)
    .build()
    .prompt()
    .advisors(a -> a
        .advisors(
            MessageChatMemoryAdvisor.builder(chatMemory).build(),
            QuestionAnswerAdvisor.builder(vectorStore).build()
        )
        .param(ChatMemory.CONVERSATION_ID, conversationId))
    .user(userText)
    .call()
    .content();
```

> **Important:** `ChatMemory.CONVERSATION_ID` must be supplied via `.param()` on every call that uses a memory advisor.

---

## 7. Chat Memory

The interface `ChatMemory` represents storage for chat conversation memory.

### 7.1 MessageWindowChatMemory

A chat memory implementation that maintains a window of messages up to a specified maximum size (default: 20 messages). Older messages are evicted while system messages are preserved.

```java
// Create chat memory with default settings (20 messages)
ChatMemory chatMemory = MessageWindowChatMemory.builder().build();

// Create with custom message window size
ChatMemory chatMemory = MessageWindowChatMemory.builder()
    .maxMessages(10)
    .build();
```

### 7.2 InMemoryChatMemoryRepository

In-memory storage implementation:

```java
ChatMemoryRepository repository = new InMemoryChatMemoryRepository();
ChatMemory chatMemory = MessageWindowChatMemory.builder()
    .chatMemoryRepository(repository)
    .build();
```

### 7.3 Other Repository Implementations

| Implementation                  | Description              |
| ------------------------------- | ------------------------ |
| `JdbcChatMemoryRepository`      | JDBC-based persistence   |
| `CassandraChatMemoryRepository` | Apache Cassandra storage |
| `Neo4jChatMemoryRepository`     | Neo4j graph database     |
| `MongoChatMemoryRepository`     | MongoDB storage          |
| `RedisChatMemoryRepository`     | Redis cache storage      |

### 7.4 Complete Chat Memory Example

```java
@Configuration
class ChatMemoryConfig {

    @Bean
    public ChatMemory chatMemory() {
        return MessageWindowChatMemory.builder()
            .chatMemoryRepository(new InMemoryChatMemoryRepository())
            .maxMessages(20)
            .build();
    }
}
```

```java
@Service
class ChatService {

    private final ChatClient chatClient;
    private final ChatMemory chatMemory;

    public ChatService(ChatClient.Builder builder, ChatMemory chatMemory) {
        this.chatClient = builder
            .defaultSystem("You are a helpful assistant.")
            .build();
        this.chatMemory = chatMemory;
    }

    public String chat(String conversationId, String userMessage) {
        return chatClient.prompt()
            .advisors(a -> a
                .advisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .param(ChatMemory.CONVERSATION_ID, conversationId))
            .user(userMessage)
            .call()
            .content();
    }
}
```

### 7.5 MemoryAdvisor Marker Interface

`MemoryAdvisor` is a marker interface that `DefaultChatClient` uses to detect downstream memory advisors in auto-registration logic.

---

## 8. Multi-Model Configuration

When multiple `ChatModel` beans are present, Spring cannot resolve the dependency without ambiguity.

### 8.1 Using @Primary

```java
@Configuration
public class MultiModelConfig {

    @Bean
    @Primary
    public OpenAiChatModel primaryChatModel(/* dependencies */) {
        return OpenAiChatModel.builder()
            .options(OpenAiChatOptions.builder()
                .model("gpt-4")
                .build())
            .build();
    }

    @Bean
    public AnthropicChatModel secondaryChatModel(/* dependencies */) {
        return AnthropicChatModel.builder()
            .options(AnthropicChatOptions.builder()
                .model("claude-3-opus")
                .build())
            .build();
    }

    @Bean
    public ChatClient primaryChatClient(ChatClient.Builder builder) {
        return builder.build();
    }

    @Bean
    public ChatClient secondaryChatClient(ChatClient.Builder builder) {
        return builder.defaultSystem("You are Claude.").build();
    }
}
```

### 8.2 Using ChatClientBuilderConfigurer

For full observability and customizer support:

```java
@Configuration
public class FullMultiModelConfig {

    @Bean
    public ChatClient openAiChatClient(
            OpenAiChatModel chatModel,
            ChatClientBuilderConfigurer configurer,
            ObjectProvider<ObservationRegistry> observationRegistry,
            ObjectProvider<ChatClientObservationConvention> chatClientObservationConvention,
            ObjectProvider<AdvisorObservationConvention> advisorObservationConvention,
            ObjectProvider<ToolCallingAdvisor.Builder<?>> toolCallingAdvisorBuilder) {

        return ChatClient.builder(chatModel,
                observationRegistry.getIfUnique(() -> ObservationRegistry.NOOP),
                chatClientObservationConvention.getIfUnique(),
                advisorObservationConvention.getIfUnique(),
                toolCallingAdvisorBuilder.getIfAvailable())
            .build();
    }
}
```

---

## 9. Metadata

The ChatClient supports adding metadata to both user and system messages.

### 9.1 User Message Metadata

```java
// Individual metadata entries
String response = chatClient.prompt()
    .user(u -> u.text("What's the weather like?")
        .metadata("messageId", "msg-123")
        .metadata("userId", "user-456")
        .metadata("priority", "high"))
    .call()
    .content();

// Multiple metadata entries at once
Map<String, Object> userMetadata = Map.of(
    "messageId", "msg-123",
    "userId", "user-456",
    "timestamp", System.currentTimeMillis()
);

String response = chatClient.prompt()
    .user(u -> u.text("What's the weather like?")
        .metadata(userMetadata))
    .call()
    .content();
```

### 9.2 System Message Metadata

```java
String response = chatClient.prompt()
    .system(s -> s.text("You are a helpful assistant.")
        .metadata("version", "1.0")
        .metadata("model", "gpt-4"))
    .user("Tell me a joke")
    .call()
    .content();
```

### 9.3 Default Metadata

```java
@Configuration
class Config {
    @Bean
    ChatClient chatClient(ChatClient.Builder builder) {
        return builder
            .defaultSystem(s -> s.text("You are a helpful assistant")
                .metadata("assistantType", "general")
                .metadata("version", "1.0"))
            .defaultUser(u -> u.text("Default user context")
                .metadata("sessionId", "default-session"))
            .build();
    }
}
```

### 9.4 Metadata Validation

- Metadata keys cannot be null or empty
- Metadata values cannot be null
- When passing a Map, neither keys nor values can contain null elements

```java
// These will throw IllegalArgumentException
chatClient.prompt()
    .user(u -> u.text("Hello").metadata(null, "value"))  // Invalid: null key
    .call()
    .content();

chatClient.prompt()
    .user(u -> u.text("Hello").metadata("key", null))    // Invalid: null value
    .call()
    .content();
```

---

## Quick Reference Cheatsheet

### Basic Usage

```java
// Inject and use
@RestController
class Controller {
    private final ChatClient chatClient;
    Controller(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @GetMapping("/ai")
    String ai(String message) {
        return chatClient.prompt().user(message).call().content();
    }
}
```

### With System Message

```java
ChatClient chatClient = builder
    .defaultSystem("You are a helpful assistant.")
    .build();

chatClient.prompt().user("Hello").call().content();
```

### With Parameters

```java
chatClient.prompt()
    .user(u -> u.text("Tell me about {topic}").param("topic", "AI"))
    .call()
    .content();
```

### With Tools

```java
chatClient.prompt()
    .user("What's the weather in Tokyo?")
    .tools(new WeatherService())
    .call()
    .content();
```

### With Memory

```java
chatClient.prompt()
    .advisors(a -> a
        .advisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
        .param(ChatMemory.CONVERSATION_ID, "user-123"))
    .user("What did I ask earlier?")
    .call()
    .content();
```

### Streaming

```java
Flux<String> stream = chatClient.prompt()
    .user("Write a story")
    .stream()
    .content();
```

### Entity Mapping

```java
record Recipe(String name, List<String> ingredients, List<String> instructions) {}

Recipe recipe = chatClient.prompt()
    .user("Generate a recipe for chocolate cake")
    .call()
    .entity(Recipe.class);
```
