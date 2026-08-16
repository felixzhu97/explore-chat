# Spring AI Embeddings Reference

> **Spring AI 2.0 Official Documentation Reference**

---

## 1. Overview

### What Are Embeddings?

Embeddings are **dense vector representations** of text, images, or other data that capture semantic meaning in a numerical format. They transform discrete data (like words or sentences) into arrays of floating-point numbers that can be compared mathematically.

```
Text → "Hello, world!" → [0.123, -0.456, 0.789, ..., 0.234] (1536 dimensions for OpenAI)
```

### Why Are Embeddings Important?

| Use Case                                 | Description                                              |
| ---------------------------------------- | -------------------------------------------------------- |
| **Semantic Search**                      | Find similar content based on meaning, not just keywords |
| **Similarity Matching**                  | Compare documents, products, or user profiles            |
| **Clustering**                           | Group similar items together in vector space             |
| **RAG (Retrieval-Augmented Generation)** | Ground LLM responses with relevant context               |
| **Recommendation Systems**               | Suggest items based on embedding similarity              |

### How Embeddings Work

```
                    ┌─────────────────────────────────────┐
                    │           Vector Space              │
                    │                                      │
                    │     "cat" ●───────── "dog"          │
                    │        \           /                │
                    │         \         /                 │
                    │          \       /                  │
                    │           \     /                   │
                    │            "pet"                    │
                    │                                      │
                    │     "car" ────────── "vehicle"      │
                    │                                      │
                    └─────────────────────────────────────┘
                         Semantic similarity via
                         cosine similarity or dot product
```

---

## 2. EmbeddingModel Interface

### Core Interface

Spring AI provides the `EmbeddingModel` interface as the abstraction for all embedding operations.

```java
package org.springframework.ai.modelembedding;

public interface EmbeddingModel {

    /**
     * Generate embeddings for a single text input.
     */
    EmbeddingResponse call(EmbeddingsOptions options);

    /**
     * Generate embeddings for multiple text inputs.
     */
    default EmbeddingResponse call(List<String> texts) {
        return call(EmbeddingsOptions.builder()
            .withTextInputs(texts)
            .build());
    }

    /**
     * Get the dimensions of embeddings produced by this model.
     */
    int dimensions();
}
```

### Usage Example

```java
@Service
@RequiredArgsConstructor
public class EmbeddingService {

    private final EmbeddingModel embeddingModel;

    public List<Double> embedText(String text) {
        EmbeddingResponse response = embeddingModel.call(List.of(text));
        return response.getResult().getEmbedding();
    }

    public List<List<Double>> embedTexts(List<String> texts) {
        EmbeddingResponse response = embeddingModel.call(texts);
        return response.getResults().stream()
            .map(Embedding::getEmbedding)
            .toList();
    }
}
```

---

## 3. EmbeddingResponse

### Response Structure

```java
public class EmbeddingResponse {

    private final List<EmbeddingResult> results;
    private final Map<String, Object> metadata;

    public List<EmbeddingResult> getResults() { ... }
    public EmbeddingResult getResult() { ... }
    public Map<String, Object> getMetadata() { ... }
}

public class EmbeddingResult {

    private final int index;
    private final List<Double> embedding;
    private final String content;  // Original text

    public int getIndex() { ... }
    public List<Double> getEmbedding() { ... }
    public String getContent() { ... }
}
```

### Response Metadata

Different providers include various metadata in the response:

```java
// Access metadata from response
EmbeddingResponse response = embeddingModel.call(texts);

// Provider-specific metadata
Map<String, Object> metadata = response.getMetadata();

// Common metadata keys:
// - "model": Model identifier (e.g., "text-embedding-3-small")
// - "usage": Token usage information
// - "created": Timestamp of request
```

---

## 4. Usage Patterns

### 4.1 Synchronous Usage

```java
@Service
public class DocumentEmbeddingService {

    private final EmbeddingModel embeddingModel;

    public void processDocuments(List<Document> documents) {
        for (Document doc : documents) {
            // Single embedding call
            EmbeddingResponse response = embeddingModel.call(
                List.of(doc.getContent())
            );

            List<Double> embedding = response.getResult().getEmbedding();
            doc.setEmbedding(embedding);
        }
    }

    public void processDocumentsBatch(List<Document> documents) {
        // Batch embedding for better performance
        List<String> texts = documents.stream()
            .map(Document::getContent)
            .toList();

        EmbeddingResponse response = embeddingModel.call(texts);

        for (int i = 0; i < documents.size(); i++) {
            documents.get(i).setEmbedding(
                response.getResults().get(i).getEmbedding()
            );
        }
    }
}
```

### 4.2 Streaming Usage (Reactive)

```java
@Service
public class ReactiveEmbeddingService {

    private final EmbeddingModel embeddingModel;

    public Mono<List<Double>> embedTextAsync(String text) {
        return Mono.fromCallable(() ->
            embeddingModel.call(List.of(text))
        )
        .map(response -> response.getResult().getEmbedding());
    }

    public Flux<EmbeddingResult> embedTextsStream(List<String> texts) {
        return Flux.fromIterable(texts)
            .flatMap(text -> Mono.fromCallable(() ->
                embeddingModel.call(List.of(text))
            ))
            .map(EmbeddingResponse::getResult);
    }
}
```

### 4.3 With Spring Data Vector Store

```java
@Configuration
@EnableJpaRepositories
public class VectorStoreConfig {

    @Bean
    public VectorStore vectorStore(
            EmbeddingModel embeddingModel,
            ApplicationContext context) {

        // Using PostgreSQL with pgvector
        return new SimpleVectorStore(embeddingModel);
    }
}

@Service
@RequiredArgsConstructor
public class SemanticSearchService {

    private final VectorStore vectorStore;
    private final EmbeddingModel embeddingModel;

    public void indexDocument(String content, Map<String, Object> metadata) {
        Document document = new Document(content, metadata);
        vectorStore.add(List.of(document));
    }

    public List<Document> search(String query, int topK) {
        // Search will automatically embed the query
        return vectorStore.similaritySearch(
            SearchRequest.query(query)
                .withTopK(topK)
        );
    }
}
```

---

## 5. Common Providers

### 5.1 OpenAI

**Dependency:**

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
</dependency>
```

**Configuration:**

```yaml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      embedding:
        options:
          model: text-embedding-3-small # or text-embedding-3-large, text-embedding-ada-002
```

**Usage:**

```java
@Configuration
public class OpenAiConfig {

    @Bean
    public OpenAiApi openAiApi(@Value("${spring.ai.openai.api-key}") String apiKey) {
        return OpenAiApi.builder()
            .apiKey(apiKey)
            .build();
    }

    @Bean
    public EmbeddingModel embeddingModel(OpenAiApi openAiApi) {
        return new OpenAiEmbeddingModel(openAiApi,
            OpenAiEmbeddingOptions.builder()
                .model("text-embedding-3-small")
                .encodingFormat("float")
                .dimensions(1536)  // Optional: reduce dimensions for smaller vectors
                .build()
        );
    }
}
```

### 5.2 Ollama (Local Models)

**Dependency:**

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-ollama-spring-boot-starter</artifactId>
</dependency>
```

**Configuration:**

```yaml
spring:
  ai:
    ollama:
      base-url: http://localhost:11434
      embedding:
        options:
          model: nomic-embed-text # Popular local embedding model
```

**Supported Models:**
| Model | Dimensions | Description |
|-------|------------|-------------|
| `nomic-embed-text` | 768 | High-quality general-purpose embeddings |
| `qwen3-embedding:0.6b` | 1024 | Qwen3 Embedding (default local) |
| `qwen3-embedding:4b` / `:8b` | 2560 / up to 4096 | Larger Qwen3 Embedding variants |
| `all-minilm` | 384 | Lightweight, fast embeddings |

**Usage:**

```java
@Service
public class OllamaEmbeddingService {

    private final EmbeddingModel embeddingModel;

    public List<Double> embedWithOllama(String text) {
        EmbeddingResponse response = embeddingModel.call(List.of(text));
        return response.getResult().getEmbedding();
    }
}
```

### 5.3 Azure OpenAI

```yaml
spring:
  ai:
    azure:
      openai:
        api-key: ${AZURE_OPENAI_API_KEY}
        endpoint: https://your-resource.openai.azure.com
        embedding:
          options:
            deployment-name: text-embedding-3-small
```

### 5.4 Amazon Bedrock

```yaml
spring:
  ai:
    bedrock:
      aws:
        region: us-east-1
        access-key: ${AWS_ACCESS_KEY}
        secret-key: ${AWS_SECRET_KEY}
        embedding:
          model: amazon.titan-embed-text-v1
```

---

## 6. Configuration

### Spring Boot Properties

```yaml
# Global embedding configuration
spring:
  ai:
    embedding:
      # Default options applied to all embedding calls
      options:
        normalize: true # Normalize embeddings to unit length

  # Provider-specific configuration
  openai:
    embedding:
      options:
        model: text-embedding-3-small
        batch-size: 100 # Max texts per batch

  ollama:
    embedding:
      options:
        model: nomic-embed-text
        temperature: 0.0
```

### Programmatic Configuration

```java
@Configuration
public class EmbeddingConfiguration {

    @Bean
    public EmbeddingModel embeddingModel(
            OpenAiApi openAiApi,
            @Value("${app.embedding.dimensions:1536}") int dimensions) {

        OpenAiEmbeddingOptions options = OpenAiEmbeddingOptions.builder()
            .model("text-embedding-3-small")
            .dimensions(dimensions)
            .encodingFormat("float")
            .build();

        return new OpenAiEmbeddingModel(openAiApi, options);
    }
}
```

### Environment Variables

| Variable               | Description       | Example                  |
| ---------------------- | ----------------- | ------------------------ |
| `OPENAI_API_KEY`       | OpenAI API key    | `sk-...`                 |
| `OLLAMA_BASE_URL`      | Ollama server URL | `http://localhost:11434` |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI key  | `...`                    |

---

## 7. Dimension Limits

### Understanding Embedding Dimensions

Embedding dimensions represent the length of the vector produced by the embedding model. Different models produce different dimensionalities:

| Model                    | Dimensions      | Use Case                     |
| ------------------------ | --------------- | ---------------------------- |
| `text-embedding-ada-002` | 1536            | Legacy, general use          |
| `text-embedding-3-small` | 1536 (1536)     | Good quality, cost-effective |
| `text-embedding-3-large` | 3072 (256-3072) | Best quality, higher cost    |
| `nomic-embed-text`       | 768             | Local, good quality          |
| `all-minilm-l6-v2`       | 384             | Fast, lightweight            |

### Dimension Reduction

Spring AI supports dimension reduction for compatibility with vector stores:

```java
// OpenAI text-embedding-3-small with reduced dimensions
@Configuration
public class ReducedEmbeddingConfig {

    @Bean
    public EmbeddingModel embeddingModel(OpenAiApi openAiApi) {
        // Request 256 dimensions instead of full 1536
        OpenAiEmbeddingOptions options = OpenAiEmbeddingOptions.builder()
            .model("text-embedding-3-small")
            .dimensions(256)  // Reduce to fit your vector store
            .build();

        return new OpenAiEmbeddingModel(openAiApi, options);
    }
}
```

### Matching Vector Store Dimensions

When using vector stores, ensure embedding dimensions match:

```java
@Service
public class VectorSearchService {

    private final VectorStore vectorStore;
    private final EmbeddingModel embeddingModel;

    public void initializeStore() {
        // Verify dimension compatibility
        int embeddingDimensions = embeddingModel.dimensions();
        System.out.println("Embedding dimensions: " + embeddingDimensions);

        // Most vector stores will handle dimension mismatches,
        // but matching improves storage efficiency
    }
}
```

---

## 8. Best Practices

### 8.1 Batch Processing

```java
@Service
@RequiredArgsConstructor
public class BatchEmbeddingService {

    private final EmbeddingModel embeddingModel;

    @Value("${app.embedding.batch-size:100}")
    private int batchSize;

    public List<List<Double>> embedInBatches(List<String> texts) {
        List<List<Double>> allEmbeddings = new ArrayList<>();

        for (int i = 0; i < texts.size(); i += batchSize) {
            List<String> batch = texts.subList(
                i,
                Math.min(i + batchSize, texts.size())
            );

            EmbeddingResponse response = embeddingModel.call(batch);

            List<List<Double>> batchEmbeddings = response.getResults().stream()
                .map(EmbeddingResult::getEmbedding)
                .toList();

            allEmbeddings.addAll(batchEmbeddings);
        }

        return allEmbeddings;
    }
}
```

### 8.2 Caching Embeddings

```java
@Configuration
@EnableCaching
public class EmbeddingCacheConfig {

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("embeddings");
    }
}

@Service
@RequiredArgsConstructor
public class CachedEmbeddingService {

    private final EmbeddingModel embeddingModel;
    private final CacheManager cacheManager;

    public List<Double> embedWithCache(String text) {
        Cache cache = cacheManager.getCache("embeddings");

        // Check cache first
        String hash = computeHash(text);
        List<Double> cached = cache.get(hash, List.class);

        if (cached != null) {
            return cached;
        }

        // Generate and cache
        EmbeddingResponse response = embeddingModel.call(List.of(text));
        List<Double> embedding = response.getResult().getEmbedding();

        cache.put(hash, embedding);
        return embedding;
    }

    private String computeHash(String text) {
        return Integer.toHexString(text.hashCode());
    }
}
```

### 8.3 Error Handling

```java
@Service
public class ResilientEmbeddingService {

    private final EmbeddingModel embeddingModel;
    private final RetryTemplate retryTemplate;

    public List<Double> embedWithRetry(String text) {
        return retryTemplate.execute(context -> {
            EmbeddingResponse response = embeddingModel.call(List.of(text));
            return response.getResult().getEmbedding();
        });
    }
}

@Configuration
public class RetryConfig {

    @Bean
    public RetryTemplate retryTemplate() {
        RetryTemplate template = new RetryTemplate();

        ExponentialBackOffPolicy backOff = new ExponentialBackOffPolicy();
        backOff.setInitialInterval(1000);
        backOff.setMultiplier(2.0);
        backOff.setMaxInterval(10000);
        backOff.setMaxAttempts(3);

        template.setBackOffPolicy(backOff);

        // Don't retry on validation errors
        template.setRetryPolicy(new SimpleRetryPolicy(3,
            Map.of(
                IllegalArgumentException.class, false,
                RuntimeException.class, true
            )
        ));

        return template;
    }
}
```

### 8.4 Performance Optimization

```java
@Service
public class OptimizedEmbeddingService {

    private final EmbeddingModel embeddingModel;
    private final ExecutorService executor;

    public OptimizedEmbeddingService() {
        this.executor = Executors.newFixedThreadPool(4);
    }

    public CompletableFuture<List<Double>> embedAsync(String text) {
        return CompletableFuture.supplyAsync(() -> {
            EmbeddingResponse response = embeddingModel.call(List.of(text));
            return response.getResult().getEmbedding();
        }, executor);
    }

    public List<List<Double>> embedParallel(List<String> texts, int threads) {
        ExecutorService customExecutor = Executors.newFixedThreadPool(threads);

        List<CompletableFuture<List<Double>>> futures = texts.stream()
            .map(text -> CompletableFuture.supplyAsync(() ->
                embeddingModel.call(List.of(text)).getResult().getEmbedding(),
                customExecutor
            ))
            .toList();

        return futures.stream()
            .map(CompletableFuture::join)
            .toList();
    }
}
```

### 8.5 Semantic Similarity Calculation

```java
@Service
public class SimilarityService {

    /**
     * Calculate cosine similarity between two embeddings.
     */
    public double cosineSimilarity(List<Double> a, List<Double> b) {
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < a.size(); i++) {
            dotProduct += a.get(i) * b.get(i);
            normA += a.get(i) * a.get(i);
            normB += b.get(i) * b.get(i);
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Find most similar texts from a collection.
     */
    public List<SimilarityResult> findMostSimilar(
            String query,
            List<ScoredDocument> documents,
            EmbeddingModel embeddingModel,
            int topK) {

        List<Double> queryEmbedding = embeddingModel.call(List.of(query))
            .getResult().getEmbedding();

        return documents.stream()
            .map(doc -> new SimilarityResult(
                doc,
                cosineSimilarity(queryEmbedding, doc.getEmbedding())
            ))
            .sorted(Comparator.comparing(SimilarityResult::score).reversed())
            .limit(topK)
            .toList();
    }

    public record SimilarityResult(ScoredDocument document, double score) {}
    public record ScoredDocument(String content, Map<String, Object> metadata, List<Double> embedding) {}
}
```

---

## Quick Reference

### Common Operations

```java
// Single text embedding
List<Double> embedding = embeddingModel.call(List.of("Hello")).getResult().getEmbedding();

// Multiple text embeddings
List<List<Double>> embeddings = embeddingModel.call(texts).getResults().stream()
    .map(EmbeddingResult::getEmbedding)
    .toList();

// Get dimensions
int dims = embeddingModel.dimensions();

// Async with WebClient
Flux<EmbeddingResult> stream = reactiveEmbeddingModel.stream(List.of("text"));
```

### Provider Selection Guide

| Provider         | Best For                  | Limitations          |
| ---------------- | ------------------------- | -------------------- |
| **OpenAI**       | Production, high quality  | Cost, API dependency |
| **Ollama**       | Privacy, local deployment | Slower, requires GPU |
| **Azure OpenAI** | Enterprise, compliance    | Complex setup        |
| **Bedrock**      | AWS integration           | AWS dependency       |

---

## See Also

- [Spring AI Documentation](https://docs.spring.io/spring-ai/reference/)
- [Vector Stores](./vector-stores.md)
- [RAG Implementation](./rag.md)
- [Model Configuration](./model-configuration.md)
