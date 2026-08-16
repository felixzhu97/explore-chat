# Spring AI Vector Store Reference

> **Version**: Spring AI 2.0+  
> **Last Updated**: 2026-06-13

---

## 1. Overview

Vector Store is a core component in Spring AI for storing and retrieving vector embeddings. It enables semantic search capabilities by storing text documents as high-dimensional vectors and performing similarity searches.

### Key Capabilities

- **Semantic Search**: Find similar documents based on meaning, not just keywords
- **Metadata Filtering**: Filter results by document metadata using SQL-like expressions
- **Multiple Backends**: Support for various vector databases (PostgreSQL, Pinecone, Qdrant, etc.)
- **Auto-configuration**: Spring Boot starters for easy setup

---

## 2. VectorStore Interface

The `VectorStore` interface is the central abstraction for vector storage operations.

### Core Methods

```java
package org.springframework.ai.vectorstore;

public interface VectorStore {

    /**
     * Add documents to the vector store
     */
    void add(Document document);
    void add(List<Document> documents);

    /**
     * Delete documents by ID
     */
    void delete(String id);
    void delete(List<String> ids);

    /**
     * Search for similar documents
     */
    List<Document> similaritySearch(SearchRequest request);
    List<Document> similaritySearch(String query);

    /**
     * Check if a document exists
     */
    boolean exists(String id);

    /**
     * Get a document by ID
     */
    Optional<Document> get(String id);
}
```

### Document Structure

```java
package org.springframework.ai.document;

public class Document {

    private String id;              // Unique identifier
    private String content;         // Text content
    private Map<String, Object> metadata;  // Metadata key-value pairs

    public Document(String content) { }
    public Document(String content, Map<String, Object> metadata) { }

    public String getId() { return id; }
    public String getContent() { return content; }
    public Map<String, Object> getMetadata() { return metadata; }

    // Metadata helpers
    public <T> T getMetadata(String key, Class<T> type) { }
    public Object getMetadata(String key) { }
    public Document withMetadata(String key, Object value) { }
}
```

### Example: Basic Operations

```java
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final VectorStore vectorStore;

    public void storeDocument() {
        // Create document with metadata
        Document doc = new Document(
            "Spring AI makes it easy to build AI applications",
            Map.of(
                "author", "Spring Team",
                "category", "tutorial",
                "rating", 5
            )
        );

        // Add to vector store
        vectorStore.add(doc);
    }

    public void searchDocuments(String query) {
        // Simple similarity search
        List<Document> results = vectorStore.similaritySearch(query);

        results.forEach(doc -> {
            System.out.println("ID: " + doc.getId());
            System.out.println("Content: " + doc.getContent());
            System.out.println("Metadata: " + doc.getMetadata());
        });
    }

    public void deleteDocument(String id) {
        vectorStore.delete(id);
    }
}
```

---

## 3. Supported Vector Databases

### 3.1 PostgreSQL with PGVector

**Maven Dependency**

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-postgresML-vectorstore</artifactId>
</dependency>
```

**Spring Boot Configuration**

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/vector_db
    username: postgres
    password: password

  ai:
    vectorstore:
      postgres:
        index-type: HNSW # or IVFFlat
        distance-type: COSINE_DISTANCE # or L2, DOT_PRODUCT
        dimensions: 1536 # OpenAI ada-002 dimensions
        table-name: vector_store
```

**Java Configuration**

```java
@Configuration
public class PostgresVectorStoreConfig {

    @Bean
    public VectorStore vectorStore(JdbcTemplate jdbcTemplate, EmbeddingModel embeddingModel) {
        return PostgresVectorStore.builder(jdbcTemplate, embeddingModel)
            .indexType(IndexType.HNSW)
            .distanceType(DistanceType.COSINE_DISTANCE)
            .dimensions(1536)
            .tableName("documents")
            .build();
    }
}
```

---

### 3.2 Pinecone

**Maven Dependency**

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-pinecone-vectorstore</artifactId>
</dependency>
```

**Spring Boot Configuration**

```yaml
spring:
  ai:
    vectorstore:
      pinecone:
        api-key: ${PINECONE_API_KEY}
        environment: us-east-1
        project-id: ${PINECONE_PROJECT_ID}
        index-name: spring-ai-demo
```

**Java Configuration**

```java
@Configuration
public class PineconeVectorStoreConfig {

    @Bean
    public VectorStore vectorStore(EmbeddingModel embeddingModel) {
        return PineconeVectorStore.builder()
            .apiKey(System.getenv("PINECONE_API_KEY"))
            .environment("us-east-1")
            .projectId(System.getenv("PINECONE_PROJECT_ID"))
            .indexName("spring-ai-demo")
            .embeddingModel(embeddingModel)
            .build();
    }
}
```

---

### 3.3 Qdrant

**Maven Dependency**

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-qdrant-vectorstore</artifactId>
</dependency>
```

**Spring Boot Configuration**

```yaml
spring:
  ai:
    vectorstore:
      qdrant:
        host: localhost
        port: 6333
        scheme: http
        collection-name: documents
```

**Java Configuration**

```java
@Configuration
public class QdrantVectorStoreConfig {

    @Bean
    public VectorStore vectorStore(EmbeddingModel embeddingModel) {
        return QdrantVectorStore.builder()
            .host("localhost")
            .port(6333)
            .scheme("http")
            .collectionName("documents")
            .embeddingModel(embeddingModel)
            .build();
    }
}
```

---

### 3.4 Redis

**Maven Dependency**

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-redis-vectorstore</artifactId>
</dependency>
```

**Spring Boot Configuration**

```yaml
spring:
  ai:
    vectorstore:
      redis:
        index-name: spring-ai-index
        distance-type: COSINE
        vector-field: content_vector
        content-field: content
```

**Java Configuration**

```java
@Configuration
public class RedisVectorStoreConfig {

    @Bean
    public VectorStore vectorStore(EmbeddingModel embeddingModel, RedisClient redisClient) {
        return RedisVectorStore.builder()
            .redisClient(redisClient)
            .embeddingModel(embeddingModel)
            .indexName("spring-ai-index")
            .build();
    }
}
```

---

### 3.5 Weaviate

**Maven Dependency**

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-weaviate-vectorstore</artifactId>
</dependency>
```

**Spring Boot Configuration**

```yaml
spring:
  ai:
    vectorstore:
      weaviate:
        url: http://localhost:8080
        api-key: ${WEAVIATE_API_KEY}
```

---

### 3.6 MongoDB Atlas

**Maven Dependency**

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-mongodb-atlas-vectorstore</artifactId>
</dependency>
```

**Spring Boot Configuration**

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/vector_db

  ai:
    vectorstore:
      mongodb:
        collection-name: documents
        index-name: vector_index
```

---

### 3.7 Neo4j

**Maven Dependency**

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-neo4j-vectorstore</artifactId>
</dependency>
```

**Spring Boot Configuration**

```yaml
spring:
  data:
    neo4j:
      uri: bolt://localhost:7687
      username: neo4j
      password: password

  ai:
    vectorstore:
      neo4j:
        index-name: document_index
```

---

### 3.8 Milvus

**Maven Dependency**

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-milvus-vectorstore</artifactId>
</dependency>
```

**Spring Boot Configuration**

```yaml
spring:
  ai:
    vectorstore:
      milvus:
        url: http://localhost:19530
        collection-name: documents
```

---

### 3.9 Chroma

**Maven Dependency**

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-chroma-vectorstore</artifactId>
</dependency>
```

**Spring Boot Configuration**

```yaml
spring:
  ai:
    vectorstore:
      chroma:
        url: http://localhost:8000
```

---

## 4. FilterExpression API

The FilterExpression API provides SQL-like filtering capabilities for vector searches.

### Supported Operators

| Operator | Description           | Example                             |
| -------- | --------------------- | ----------------------------------- |
| `eq`     | Equals                | `eq("category", "tutorial")`        |
| `ne`     | Not equals            | `ne("status", "archived")`          |
| `gt`     | Greater than          | `gt("rating", 4)`                   |
| `gte`    | Greater than or equal | `gte("price", 100)`                 |
| `lt`     | Less than             | `lt("stock", 10)`                   |
| `lte`    | Less than or equal    | `lte("priority", 5)`                |
| `in`     | In list               | `in("category", List.of("A", "B"))` |
| `nin`    | Not in list           | `nin("status", List.of("X", "Y"))`  |
| `and`    | Logical AND           | `and(eq(...), gt(...))`             |
| `or`     | Logical OR            | `or(eq(...), eq(...))`              |
| `not`    | Logical NOT           | `not(eq(...))`                      |

### FilterExpression Builder

```java
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;

// Create filters using the builder
FilterExpressionBuilder b = new FilterExpressionBuilder();

// Simple equality
FilterExpression eq = b.eq("category", "tutorial");

// Numeric comparison
FilterExpression gt = b.gt("rating", 4);

// Compound conditions
FilterExpression combined = b.and(
    b.eq("author", "John"),
    b.gte("rating", 4)
);

// OR condition
FilterExpression or = b.or(
    b.eq("category", "tutorial"),
    b.eq("category", "guide")
);

// IN clause
FilterExpression in = b.in("status", List.of("active", "pending"));

// NOT condition
FilterExpression not = b.not(b.eq("status", "deleted"));
```

### Complete Filtering Examples

```java
@Service
public class FilteredSearchService {

    private final VectorStore vectorStore;

    public List<Document> searchWithFilters() {
        FilterExpressionBuilder b = new FilterExpressionBuilder();

        // Filter by multiple metadata fields
        FilterExpression filter = b.and(
            b.eq("approved", true),
            b.gte("rating", 4),
            b.in("category", List.of("tutorial", "guide", "reference"))
        );

        SearchRequest request = SearchRequest.builder()
            .query("How to use Spring AI?")
            .topK(10)
            .filterExpression(filter)
            .build();

        return vectorStore.similaritySearch(request);
    }

    public List<Document> searchByAuthor(String author) {
        SearchRequest request = SearchRequest.builder()
            .query("Spring framework")
            .topK(5)
            .filterExpression(new FilterExpressionBuilder().eq("author", author))
            .build();

        return vectorStore.similaritySearch(request);
    }

    public List<Document> searchDateRange() {
        FilterExpressionBuilder b = new FilterExpressionBuilder();

        FilterExpression dateFilter = b.and(
            b.gte("createdAt", "2024-01-01"),
            b.lt("createdAt", "2024-12-31")
        );

        SearchRequest request = SearchRequest.builder()
            .query("AI tutorials")
            .topK(20)
            .filterExpression(dateFilter)
            .build();

        return vectorStore.similaritySearch(request);
    }
}
```

---

## 5. SearchRequest API

The `SearchRequest` class configures vector similarity searches with various parameters.

### SearchRequest Builder

```java
package org.springframework.ai.vectorstore;

public class SearchRequest {

    private String query;                          // Search query text
    private int topK = 4;                         // Number of results
    private double similarityThreshold = 0.0;     // Minimum similarity score
    private FilterExpression filterExpression;    // Metadata filters
    private boolean includeEmbeddings = false;    // Include vectors in results

    public static SearchRequest builder() { ... }
}
```

### Example: Complete SearchRequest

```java
public List<Document> advancedSearch() {
    // Build complex search request
    SearchRequest request = SearchRequest.builder()
        .query("How to implement RAG with Spring AI?")
        .topK(10)                                    // Return top 10 results
        .similarityThreshold(0.75)                   // Minimum 75% similarity
        .filterExpression(
            new FilterExpressionBuilder()
                .and(
                    eq("approved", true),
                    gte("rating", 4)
                )
        )
        .includeEmbeddings(false)
        .build();

    return vectorStore.similaritySearch(request);
}
```

### Similarity Threshold Guide

| Threshold | Use Case                             |
| --------- | ------------------------------------ |
| 0.9 - 1.0 | Very strict, almost exact matches    |
| 0.7 - 0.9 | Strict, high relevance               |
| 0.5 - 0.7 | Moderate, balanced relevance         |
| 0.0 - 0.5 | Loose, includes more diverse results |

```java
// High precision search (fewer but more relevant results)
SearchRequest preciseSearch = SearchRequest.builder()
    .query(query)
    .topK(3)
    .similarityThreshold(0.85)
    .build();

// Broad search (more results, less strict)
SearchRequest broadSearch = SearchRequest.builder()
    .query(query)
    .topK(20)
    .similarityThreshold(0.5)
    .build();
```

---

## 6. Spring Boot Auto-configuration

### Enable All Vector Stores (Demo)

For development and testing, enable all vector stores:

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-vectorstore-spring-boot-starter</artifactId>
</dependency>
```

### Per-Store Starters

Each vector store has its own auto-configuration starter:

```xml
<!-- PostgreSQL -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-postgresML-vectorstore-spring-boot-starter</artifactId>
</dependency>

<!-- Pinecone -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-pinecone-vectorstore-spring-boot-starter</artifactId>
</dependency>

<!-- Qdrant -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-qdrant-vectorstore-spring-boot-starter</artifactId>
</dependency>
```

### Application Configuration Template

```yaml
spring:
  application:
    name: spring-ai-vector-demo

  # Embedding Model Configuration (required for all vector stores)
  ai:
    embedding:
      openai:
        api-key: ${OPENAI_API_KEY}

    # Choose ONE vector store below:

    # --- PostgreSQL/PGVector ---
    vectorstore:
      postgres:
        host: localhost
        port: 5432
        database: vector_db
        username: postgres
        password: password
        index-type: HNSW
        distance-type: COSINE_DISTANCE
        dimensions: 1536

    # --- Pinecone ---
    # vectorstore:
    #   pinecone:
    #     api-key: ${PINECONE_API_KEY}
    #     environment: us-east-1
    #     project-id: ${PINECONE_PROJECT_ID}
    #     index-name: spring-ai

    # --- Qdrant ---
    # vectorstore:
    #   qdrant:
    #     host: localhost
    #     port: 6333
    #     collection-name: documents

    # --- Redis ---
    # vectorstore:
    #   redis:
    #     index-name: spring-ai-index
```

### Auto-Configured Beans

When enabled, Spring Boot auto-configures:

1. **VectorStore** bean - Primary vector store instance
2. **EmbeddingModel** bean - If not explicitly configured
3. **Database-specific clients** - Connection pooling, etc.

```java
@SpringBootApplication
public class VectorStoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(VectorStoreApplication.class, args);
    }
}

@Service
public class MyService {

    // Auto-configured VectorStore injected automatically
    private final VectorStore vectorStore;

    public MyService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }
}
```

---

## 7. Best Practices

### 7.1 Index Management

```java
@Configuration
public class VectorStoreIndexConfig {

    private final VectorStore vectorStore;

    @PostConstruct
    public void initializeIndex() {
        // For PGVector: Create index if not exists
        if (vectorStore instanceof PostgresVectorStore pvs) {
            // Index is created automatically, but you can customize:
            // - Use IVFFlat for large datasets (>1M vectors)
            // - Use HNSW for faster queries with higher memory usage
        }
    }
}
```

**Index Type Selection**

| Type        | Best For             | Query Speed | Build Time | Memory |
| ----------- | -------------------- | ----------- | ---------- | ------ |
| **HNSW**    | Most use cases       | Fastest     | Slow       | Higher |
| **IVFFlat** | Large datasets (>1M) | Moderate    | Fast       | Lower  |

### 7.2 Dimension Management

```java
// Verify embedding dimensions match your model
@Service
public class EmbeddingValidationService {

    public void validateDimensions() {
        // OpenAI ada-002: 1536 dimensions
        // OpenAI text-embedding-3-small: 1536 dimensions
        // OpenAI text-embedding-3-large: 3072 dimensions
        // Cohere: 1024 dimensions

        int expectedDimensions = 1536; // Adjust based on your model

        Document doc = new Document("test");
        // Vector dimension will be validated by the vector store
    }
}
```

### 7.3 Similarity Threshold Guidelines

```java
public class ThresholdGuidance {

    public SearchRequest getSearchFor(String useCase) {
        return switch (useCase) {
            case "precise_qa" -> SearchRequest.builder()
                .query("") .topK(3).similarityThreshold(0.85).build();
            case "semantic_search" -> SearchRequest.builder()
                .query("") .topK(5).similarityThreshold(0.70).build();
            case "recommendation" -> SearchRequest.builder()
                .query("") .topK(10).similarityThreshold(0.60).build();
            case "exploration" -> SearchRequest.builder()
                .query("") .topK(20).similarityThreshold(0.50).build();
            default -> SearchRequest.builder()
                .query("") .topK(5).similarityThreshold(0.70).build();
        };
    }
}
```

### 7.4 Batch Operations

```java
@Service
public class BatchDocumentService {

    private final VectorStore vectorStore;

    public void batchAddDocuments(List<Document> documents) {
        // Batch add is more efficient than individual adds
        // Recommended batch size: 100-500 documents

        int batchSize = 100;
        for (int i = 0; i < documents.size(); i += batchSize) {
            List<Document> batch = documents.subList(
                i,
                Math.min(i + batchSize, documents.size())
            );
            vectorStore.add(batch);
        }
    }
}
```

### 7.5 Metadata Design

```java
public class MetadataDesign {

    public Document createWellStructuredDocument(
        String content,
        String author,
        LocalDateTime createdAt,
        String category
    ) {
        return new Document(content, Map.of(
            // Use consistent naming conventions
            "author_id", author,           // Use _id suffix for references
            "created_at", createdAt,       // ISO format dates
            "category", category,          // Enum-like values
            "version", 1,                  // Numeric for sorting
            "approved", true,              // Boolean for filtering

            // Store embedding model info for debugging
            "_embedding_model", "text-embedding-ada-002",
            "_embedding_dimensions", 1536
        ));
    }
}
```

### 7.6 Error Handling

```java
@Service
public class ResilientVectorStoreService {

    private final VectorStore vectorStore;
    private final RetryTemplate retryTemplate;

    public List<Document> searchWithRetry(String query) {
        return retryTemplate.execute(context -> {
            // Retry on transient failures
            return vectorStore.similaritySearch(query);
        });
    }

    @Bean
    public RetryTemplate retryTemplate() {
        return RetryTemplate.builder()
            .maxAttempts(3)
            .fixedBackoff(1000)
            .retryOn(Exception.class)
            .build();
    }
}
```

---

## 8. Quick Reference

### Dependency Matrix

| Vector Store | Artifact ID                           | Starter    |
| ------------ | ------------------------------------- | ---------- |
| PostgreSQL   | `spring-ai-postgresML-vectorstore`    | `-starter` |
| Pinecone     | `spring-ai-pinecone-vectorstore`      | `-starter` |
| Qdrant       | `spring-ai-qdrant-vectorstore`        | `-starter` |
| Redis        | `spring-ai-redis-vectorstore`         | `-starter` |
| Weaviate     | `spring-ai-weaviate-vectorstore`      | `-starter` |
| MongoDB      | `spring-ai-mongodb-atlas-vectorstore` | `-starter` |
| Neo4j        | `spring-ai-neo4j-vectorstore`         | `-starter` |
| Milvus       | `spring-ai-milvus-vectorstore`        | `-starter` |
| Chroma       | `spring-ai-chroma-vectorstore`        | `-starter` |

### Common Configuration Properties

```yaml
spring:
  ai:
    vectorstore:
      # Common settings across stores
      similarity-threshold: 0.7 # Default threshold
      top-k: 5 # Default result count
```

---

## 9. Related Resources

- [Spring AI Documentation](https://docs.spring.io/spring-ai/reference/)
- [Vector Store API Reference](https://docs.spring.io/spring-ai/reference/api/vectorstore.html)
- [Embedding Model Documentation](./embedding-model.md)
- [RAG Reference](./rag.md)
