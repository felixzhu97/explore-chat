# Spring AI 2.0 Structured Output Reference

> Complete reference guide for structured output based on Spring AI 2.0 official documentation.

---

## 1. Overview: Why Structured Output Matters

Structured Output is a key capability for LLM applications, ensuring model output can be reliably parsed into the data types (JSON, XML, Java classes, etc.) that the application needs.

### Core Value

| Scenario              | Problem Solved                                        |
| --------------------- | ----------------------------------------------------- |
| Data extraction       | Convert unstructured text to Java objects             |
| Business integration  | Output directly passed to other application functions |
| Type safety           | Avoid manual parsing and type conversion              |
| Downstream processing | Ensure output format meets API requirements           |

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                     Structured Output Flow                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    1. Format Instructions     ┌──────────────────┐ │
│  │  User    │ ────────────────────────────▶ │  LLM Model       │ │
│  │  Prompt  │                              │  (with format    │ │
│  └──────────┘                              │   guidance)      │ │
│                                             └──────────────────┘ │
│                                                      │          │
│                                                      ▼          │
│  ┌──────────┐    3. Structured Type T     ┌──────────────────┐ │
│  │ Converter│ ◀─────────────────────────── │  LLM Response     │ │
│  │          │                              │  (JSON text)     │ │
│  └──────────┘                              └──────────────────┘ │
│                                                                  │
│  Before LLM Call: Append format instructions to guide the model │
│  After LLM Call: Parse text output into structured type         │
└─────────────────────────────────────────────────────────────────┘
```

### Important Notes

> **Note**: `StructuredOutputConverter` is a best-effort conversion and does not guarantee the model will return the requested format. It is recommended to implement validation mechanisms to ensure output meets expectations.
>
> `StructuredOutputConverter` is not suitable for Tool Calling, as Tool Calling itself already provides structured output.

---

## 2. StructuredOutputConverter Interface

### Interface Definition

```java
public interface StructuredOutputConverter<T> extends Converter<String, T>, FormatProvider {
    // Inherits Converter<String, T> - converts String to T
    // Inherits FormatProvider - provides formatting instructions
}
```

### FormatProvider Interface

```java
public interface FormatProvider {
    String getFormat();
}
```

### FormatProvider Example Output

```
Your response should be in JSON format.
The data structure for the JSON should match this Java class: java.util.HashMap
Do not include any explanations, only provide a RFC8259 compliant JSON response following this format without deviation.
```

### Complete Conversion Flow

```java
// 1. Define converter
StructuredOutputConverter<MyBean> converter = new BeanOutputConverter<>(MyBean.class);

// 2. Get format instructions
String format = converter.getFormat();

// 3. Build prompt with format instructions
String template = """
    {user_input}
    {format}
    """;

Prompt prompt = PromptTemplate.builder()
    .template(template)
    .variables(Map.of("user_input", userInput, "format", format))
    .build()
    .create();

// 4. Call model
Generation generation = chatModel.call(prompt).getResult();

// 5. Convert output
MyBean result = converter.convert(generation.getOutput().getText());
```

---

## 3. BeanOutputConverter

Converts LLM output to Java Bean or Record.

### Basic Usage

```java
// Define target type
record ActorsFilms(String actor, List<String> movies) {}

// High-level API - ChatClient
ActorsFilms actorsFilms = ChatClient.create(chatModel).prompt()
    .user(u -> u.text("Generate the filmography of 5 movies for {actor}.")
                .param("actor", "Tom Hanks"))
    .call()
    .entity(ActorsFilms.class);
```

### Low-level API

```java
BeanOutputConverter<ActorsFilms> beanOutputConverter =
    new BeanOutputConverter<>(ActorsFilms.class);

String format = this.beanOutputConverter.getFormat();
String actor = "Tom Hanks";

String template = """
    Generate the filmography of 5 movies for {actor}.
    {format}
    """;

Generation generation = chatModel.call(
    PromptTemplate.builder()
        .template(this.template)
        .variables(Map.of("actor", this.actor, "format", this.format))
        .build()
        .create()
).getResult();

ActorsFilms actorsFilms = this.beanOutputConverter.convert(
    this.generation.getOutput().getText()
);
```

### Property Order Control

Use `@JsonPropertyOrder` annotation to control property order in JSON Schema:

```java
@JsonPropertyOrder({"actor", "movies"})
record ActorsFilms(String actor, List<String> movies) {}
```

### Generic Bean Types

Use `ParameterizedTypeReference` for complex nested structures:

```java
// Return List<ActorsFilms>
List<ActorsFilms> actorsFilms = ChatClient.create(chatModel).prompt()
    .user("Generate the filmography of 5 movies for Tom Hanks and Bill Murray.")
    .call()
    .entity(new ParameterizedTypeReference<List<ActorsFilms>>() {});
```

Low-level API:

```java
BeanOutputConverter<List<ActorsFilms>> outputConverter = new BeanOutputConverter<>(
    new ParameterizedTypeReference<List<ActorsFilms>>() { }
);

String format = this.outputConverter.getFormat();
String template = """
    Generate the filmography of 5 movies for Tom Hanks and Bill Murray.
    {format}
    """;

Prompt prompt = PromptTemplate.builder()
    .template(this.template)
    .variables(Map.of("format", this.format))
    .build()
    .create();

Generation generation = chatModel.call(this.prompt).getResult();
List<ActorsFilms> actorsFilms = this.outputConverter.convert(
    generation.getOutput().getText()
);
```

---

## 4. MapOutputConverter

Converts LLM output to `Map<String, Object>`.

### High-level API

```java
Map<String, Object> result = ChatClient.create(chatModel).prompt()
    .user(u -> u.text("Provide me a List of {subject}")
                .param("subject", "an array of numbers from 1 to 9 under the key name 'numbers'"))
    .call()
    .entity(new ParameterizedTypeReference<Map<String, Object>>() {});
```

### Low-level API

```java
MapOutputConverter mapOutputConverter = new MapOutputConverter();

String format = this.mapOutputConverter.getFormat();
String template = """
    Provide me a List of {subject}
    {format}
    """;

Prompt prompt = PromptTemplate.builder()
    .template(this.template)
    .variables(Map.of(
        "subject", "an array of numbers from 1 to 9 under the key name 'numbers'",
        "format", this.format
    ))
    .build()
    .create();

Generation generation = chatModel.call(this.prompt).getResult();
Map<String, Object> result = this.mapOutputConverter.convert(
    this.generation.getOutput().getText()
);
```

---

## 5. ListOutputConverter

Converts LLM output to `List<String>` (suitable for comma-separated lists).

### High-level API

```java
List<String> flavors = ChatClient.create(chatModel).prompt()
    .user(u -> u.text("List five {subject}")
                .param("subject", "ice cream flavors"))
    .call()
    .entity(new ListOutputConverter(new DefaultConversionService()));
```

### Low-level API

```java
ListOutputConverter listOutputConverter = new ListOutputConverter(
    new DefaultConversionService()
);

String format = this.listOutputConverter.getFormat();
String template = """
    List five {subject}
    {format}
    """;

Prompt prompt = PromptTemplate.builder()
    .template(this.template)
    .variables(Map.of(
        "subject", "ice cream flavors",
        "format", this.format
    ))
    .build()
    .create();

Generation generation = this.chatModel.call(this.prompt).getResult();
List<String> list = this.listOutputConverter.convert(
    this.generation.getOutput().getText()
);
```

---

## 6. Native Structured Output

Native Structured Output leverages the AI model's built-in JSON Schema support, providing more reliable results.

### Advantages

| Feature            | Description                                     |
| ------------------ | ----------------------------------------------- |
| Higher reliability | Model guarantees output conforms to Schema      |
| Simpler prompts    | No need to append format instructions           |
| Better performance | Model can internally optimize structured output |

### Enabling

Use `AdvisorParams.ENABLE_NATIVE_STRUCTURED_OUTPUT`:

```java
ActorsFilms actorsFilms = ChatClient.create(chatModel).prompt()
    .advisors(AdvisorParams.ENABLE_NATIVE_STRUCTURED_OUTPUT)
    .user("Generate the filmography for a random actor.")
    .call()
    .entity(ActorsFilms.class);
```

### Global Configuration

```java
@Bean
ChatClient chatClient(ChatClient.Builder builder) {
    return builder
        .defaultAdvisors(AdvisorParams.ENABLE_NATIVE_STRUCTURED_OUTPUT)
        .build();
}
```

---

## 7. EntityParamSpec

A Fluent API introduced in Spring AI 2.0 for fine-grained configuration of structured output during `entity()` calls.

### useProviderStructuredOutput()

Enables the provider's native structured output capability:

```java
ActorFilms result = chatClient.prompt()
    .user("Generate the filmography for a random actor.")
    .call()
    .entity(ActorFilms.class, spec -> spec.useProviderStructuredOutput());
```

### validateSchema()

Enables schema validation and automatic retry mechanism:

```java
ActorFilms result = chatClient.prompt()
    .user("Generate the filmography for a random actor.")
    .call()
    .entity(ActorFilms.class, spec -> spec.validateSchema());
```

### Combining Options

```java
ActorFilms actorFilms = chatClient.prompt()
    .user("Generate the filmography for a random actor.")
    .call()
    .entity(ActorFilms.class, spec -> spec
        .useProviderStructuredOutput()
        .validateSchema());
```

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    validateSchema() Flow                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. LLM Response                                             │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────┐                                         │
│  │ Validate JSON   │                                         │
│  │ against Schema  │                                         │
│  └─────────────────┘                                         │
│         │                                                    │
│    ┌────┴────┐                                               │
│    │ Pass?   │                                               │
│    └────┬────┘                                               │
│    Yes  │  No                                                │
│    ▼    │  ▼                                                 │
│  Return │  Append error to prompt                            │
│  Result │  ◀────────────────────────────                    │
│          │                                    │              │
│          └────────────────────────────────────┘              │
│                          Retry (up to maxRepeatAttempts)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Supported Models

### Native Structured Output Support Matrix

| Provider       | Models                      | Notes                  |
| -------------- | --------------------------- | ---------------------- |
| **OpenAI**     | GPT-4o and later            | Supports JSON Schema   |
| **Anthropic**  | Claude 3.5 Sonnet and later | Native support         |
| **Google**     | Gemini 1.5 Pro and later    | Native support         |
| **Mistral AI** | Mistral Small and later     | Supports JSON Schema   |
| **Ollama**     | Some models                 | Model-specific support |

### Built-in JSON Modes

| Provider       | Config Option                              | Description                                                                                 |
| -------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------- |
| **OpenAI**     | `spring.ai.openai.chat.response-format`    | `JSON_OBJECT` - only guarantees valid JSON<br>`JSON_SCHEMA` - guarantees Schema conformance |
| **Ollama**     | `spring.ai.ollama.chat.format=json`        | Forces JSON output                                                                          |
| **Mistral AI** | `spring.ai.mistralai.chat.response-format` | `json_object` - JSON mode<br>`json_schema` - structured output                              |

---

## 9. Known Limitations

### Ollama: Thinking Mode Issues

Models with built-in reasoning/thinking modes (such as `qwen3:8b`, `qwen3.5:9b`, etc.) may return internal reasoning traces as plain text, causing deserialization failures:

```
StreamReadException: Unrecognized token 'The': was expecting
(JSON String, Number, Array, Object or token 'null', 'true' or 'false')
```

**Solutions**:

1. Use models without thinking mode (e.g., `llama3.1:latest`)
2. Fall back to default prompt-based approach
3. Combine `useProviderStructuredOutput()` + `validateSchema()` for automatic retry

### OpenAI: Top-level Arrays Not Supported

OpenAI Structured Outputs API does not accept top-level JSON arrays as the response Schema.

**Wrong example**:

```java
// ❌ OpenAI native structured output doesn't support top-level arrays
List<ActorsFilms> films = chatClient.prompt()
    .user("Generate filmographies for Tom Hanks and Bill Murray.")
    .call()
    .entity(new ParameterizedTypeReference<List<ActorsFilms>>() {},
        spec -> spec.useProviderStructuredOutput()); // Fails!
```

**Correct approach**:

```java
// ✅ Solution 1: Wrap list in container class
record FilmographyList(List<ActorsFilms> films) {}

FilmographyList result = chatClient.prompt()
    .user("Generate filmographies for Tom Hanks and Bill Murray.")
    .call()
    .entity(FilmographyList.class, spec -> spec.useProviderStructuredOutput());

List<ActorsFilms> films = result.films();

// ✅ Solution 2: Use default prompt-based approach (no native output)
List<ActorsFilms> films = chatClient.prompt()
    .user("Generate filmographies for Tom Hanks and Bill Murray.")
    .call()
    .entity(new ParameterizedTypeReference<List<ActorsFilms>>() {});
```

---

## 10. Schema Validation: StructuredOutputValidationAdvisor

`StructuredOutputValidationAdvisor` is a recursive Advisor that validates whether the LLM's output JSON conforms to the Schema, and automatically retries on validation failure.

### Core Features

| Feature              | Description                                                           |
| -------------------- | --------------------------------------------------------------------- |
| Auto-generate Schema | Generates JSON Schema from expected output type                       |
| Validate response    | Validates whether LLM response conforms to Schema                     |
| Auto-retry           | Automatically retries on validation failure, configurable retry count |
| Prompt enhancement   | Appends validation error info to help model correct output on retry   |

> **Note**: This Advisor does not support streaming responses and will throw `UnsupportedOperationException` in streaming context.

### Global Configuration

```java
var validationAdvisor = StructuredOutputValidationAdvisor.builder()
    .outputType(MyResponseType.class)
    .maxRepeatAttempts(3)
    .advisorOrder(BaseAdvisor.HIGHEST_PRECEDENCE + 1000)
    .build();

var chatClient = ChatClient.builder(chatModel)
    .defaultAdvisors(validationAdvisor)
    .build();
```

### Builder Configuration Options

| Method                                      | Description             | Default                                 |
| ------------------------------------------- | ----------------------- | --------------------------------------- |
| `outputType(Class<T>)`                      | Set output type         | - (required)                            |
| `outputType(ParameterizedTypeReference<T>)` | Set generic output type | - (required)                            |
| `maxRepeatAttempts(int)`                    | Max retry attempts      | 3                                       |
| `advisorOrder(int)`                         | Advisor ordering        | `BaseAdvisor.HIGHEST_PRECEDENCE + 1000` |
| `jsonMapper(JsonMapper)`                    | Custom JSON processor   | Default                                 |

### Complete Usage Example

```java
// 1. Define target type
record BookSummary(String title, String author, List<String> themes) {}

// 2. Create validation Advisor
var validationAdvisor = StructuredOutputValidationAdvisor.builder()
    .outputType(BookSummary.class)
    .maxRepeatAttempts(5)
    .build();

// 3. Create ChatClient
var chatClient = ChatClient.builder(chatModel)
    .defaultAdvisors(validationAdvisor)
    .build();

// 4. Call (no extra config needed)
BookSummary result = chatClient.prompt()
    .user("Summarize '1984' by George Orwell with its main themes")
    .call()
    .entity(BookSummary.class);
```

### Relationship with EntityParamSpec.validateSchema()

```java
// Method 1: Global Advisor configuration
var validationAdvisor = StructuredOutputValidationAdvisor.builder()
    .outputType(BookSummary.class)
    .maxRepeatAttempts(5)
    .build();

// Method 2: Per-call configuration (Spring AI 2.0+ recommended)
BookSummary result = chatClient.prompt()
    .user("Summarize '1984' by George Orwell")
    .call()
    .entity(BookSummary.class, spec -> spec.validateSchema());

// Method 3: Combine both
BookSummary result = chatClient.prompt()
    .user("Summarize '1984' by George Orwell")
    .call()
    .entity(BookSummary.class, spec -> spec
        .useProviderStructuredOutput()
        .validateSchema());
```

---

## Quick Reference Cheatsheet

### Choosing the Right Converter

| Scenario         | Converter                | Example                                             |
| ---------------- | ------------------------ | --------------------------------------------------- |
| Java Bean/Record | `BeanOutputConverter<T>` | `entity(ActorsFilms.class)`                         |
| Map              | `MapOutputConverter`     | `entity(new ParameterizedTypeReference<Map<>>(){})` |
| String List      | `ListOutputConverter`    | `entity(new ListOutputConverter(...))`              |

### API Selection

| Scenario             | Recommended API                       |
| -------------------- | ------------------------------------- |
| Simple scenarios     | ChatClient high-level API             |
| Fine-grained control | Low-level `ChatModel` API             |
| Per-call config      | `entity(Type.class, spec -> spec...)` |
| Global validation    | `StructuredOutputValidationAdvisor`   |

### Configuration Priority

```
validateSchema() > StructuredOutputValidationAdvisor > Default
```

---

## References

- [Spring AI Structured Output Converter Documentation](https://docs.spring.io/spring-ai/reference/api/structured-output-converter.html)
- [Spring AI Chat Client API](https://docs.spring.io/spring-ai/reference/api/chatclient.html)
- [Spring AI Recursive Advisors](https://docs.spring.io/spring-ai/reference/api/advisors-recursive.html)
- [Spring AI 2.0.0-RC1 Release Notes](https://spring.io/blog/2026/06/06/spring-ai-2-0-0-rc1-available-now)
