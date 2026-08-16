# Spring AI 2.0 RAG (Retrieval Augmented Generation) Reference Guide

> **Based on Spring AI 2.0 Official Documentation**
> **Last Updated**: June 2026

---

## Table of Contents

1. [Overview: What is RAG and Why Use It](#1-overview-what-is-rag-and-why-use-it)
2. [Modular RAG Architecture](#2-modular-rag-architecture)
3. [QuestionAnswerAdvisor: Simple RAG Implementation](#3-questionansweradvisor-simple-rag-implementation)
4. [RetrievalAugmentationAdvisor: Advanced Modular RAG](#4-retrievalaugmentationadvisor-advanced-modular-rag)
5. [Query Transformers](#5-query-transformers)
6. [Query Expanders](#6-query-expanders)
7. [Document Retriever](#7-document-retriever)
8. [Document Joiners](#8-document-joiners)
9. [Query Augmenters](#9-query-augmenters)
10. [Document Post-Processors](#10-document-post-processors)
11. [Filter Expressions](#11-filter-expressions)
12. [Complete Example: End-to-End RAG Pipeline](#12-complete-example-end-to-end-rag-pipeline)

---

## 1. Overview: What is RAG and Why Use It

### 1.1 Definition

**RAG (Retrieval Augmented Generation)** is a technique that enhances Large Language Model (LLM) responses by retrieving relevant documents from an external knowledge base and incorporating them into the prompt context.

```
┌──────────────┐     ┌────────────────┐     ┌──────────────┐
│    Query     │ ──▶ │   Retrieval    │ ──▶ │   LLM       │
│              │     │   (Vector DB)  │     │   Generation │
└──────────────┘     └────────────────┘     └──────────────┘
                            │
                            ▼
                     ┌────────────────┐
                     │ Retrieved      │
                     │ Documents       │
                     └────────────────┘
```

### 1.2 Why Use RAG?

| Benefit                    | Description                                            |
| -------------------------- | ------------------------------------------------------ |
| **Reduced Hallucinations** | Ground responses in factual, retrieved content         |
| **Up-to-date Knowledge**   | Connect to live data sources without retraining        |
| **Domain Specificity**     | Leverage proprietary/organizational knowledge bases    |
| **Transparency**           | Provide source citations for generated responses       |
| **Cost Efficiency**        | Avoid expensive fine-tuning for knowledge retrieval    |
| **Explainability**         | Users can verify which documents informed the response |

### 1.3 Spring AI RAG Architecture

Spring AI 2.0 provides a **composable, modular RAG architecture** that allows developers to customize each phase of the retrieval and generation pipeline:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         RAG Pipeline in Spring AI 2.0                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Query ──▶ Query Transformers ──▶ Query Expanders ──▶ Retrieval         │
│                                                          │               │
│                                                          ▼               │
│   LLM ◀── Response ──▶ Response Augmenter ◀── Post-Processor ◀── Joiner │
│                        ▲                                                    │
│                        │                                                    │
│              Query Augmenter ──▶ Retrieved Documents                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Modular RAG Architecture

Spring AI 2.0 decomposes RAG into distinct phases, each handled by specialized components:

### 2.1 Phase Overview

| Phase              | Component                             | Purpose                                     |
| ------------------ | ------------------------------------- | ------------------------------------------- |
| **Pre-Retrieval**  | Query Transformers, Query Expanders   | Enhance and expand the user query           |
| **Retrieval**      | Document Retrievers                   | Fetch relevant documents from vector stores |
| **Post-Retrieval** | Document Joiners, Post-Processors     | Combine and refine retrieved documents      |
| **Generation**     | Query Augmenters, Response Augmenters | Augment prompts with context                |

### 2.2 Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Complete RAG Flow                             │
└──────────────────────────────────────────────────────────────────────┘

  ┌─────────────┐
  │   Query     │
  └──────┬──────┘
         │
         ▼
  ┌──────────────────────┐
  │  Query Transformers  │  (Optional: compress, rewrite, translate)
  └──────────┬───────────┘
             │
             ▼
  ┌──────────────────────┐
  │   Query Expanders    │  (Optional: generate multiple query variants)
  └──────────┬───────────┘
             │
             ▼
  ┌──────────────────────┐
  │   Document Retriever │  (Required: fetch from VectorStore)
  └──────────┬───────────┘
             │
             ▼
  ┌──────────────────────┐
  │   Document Joiner    │  (Optional: combine results from retrievers)
  └──────────┬───────────┘
             │
             ▼
  ┌──────────────────────┐
  │   Post-Processors    │  (Optional: rerank, compress)
  └──────────┬───────────┘
             │
             ▼
  ┌──────────────────────┐
  │  Query Augmenters   │  (Optional: add context to query)
  └──────────┬───────────┘
             │
             ▼
  ┌──────────────────────┐
  │  Response Augmenters│  (Optional: process LLM response)
  └──────────┬───────────┘
             │
             ▼
  ┌──────────────┐
  │  LLM + RAG   │
  └──────────────┘
```

---

## 3. QuestionAnswerAdvisor: Simple RAG Implementation

### 3.1 Overview

`QuestionAnswerAdvisor` is the simplest way to implement RAG in Spring AI. It retrieves documents from a `VectorStore` and adds them to the chat context.

### 3.2 Configuration

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-vector-store-pgvector</artifactId>
</dependency>
```

### 3.3 Properties Configuration

```yaml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
    vectorstore:
      pgvector:
        dimensions: 1536
```

### 3.4 Basic Usage

```java
@Service
public class SimpleRagService {

    private final VectorStore vectorStore;
    private final ChatClient chatClient;

    public SimpleRagService(VectorStore vectorStore, ChatClient.Builder chatClientBuilder) {
        this.vectorStore = vectorStore;
        this.chatClient = chatClientBuilder.build();
    }

    public String answerQuestion(String question) {
        // QuestionAnswerAdvisor handles retrieval automatically
        Prompt prompt = new Prompt(
            new UserMessage(question),
            QuestionAnswerAdvisor.builder(vectorStore)
                .template("Answer the question using the retrieved documents.\n{question}\n{context}")
                .build()
        );

        return chatClient.prompt(prompt)
            .call()
            .content();
    }
}
```

### 3.5 QuestionAnswerAdvisor Options

| Option                | Type                    | Default        | Description                                                    |
| --------------------- | ----------------------- | -------------- | -------------------------------------------------------------- |
| `vectorStore`         | VectorStore             | Required       | The vector store to query                                      |
| `template`            | String                  | System default | Prompt template with `{question}` and `{context}` placeholders |
| `defaultTopK`         | int                     | 4              | Number of documents to retrieve                                |
| `similarityThreshold` | double                  | 0.0            | Minimum similarity score (0.0 = disabled)                      |
| `searchRequest`       | Supplier<SearchRequest> | null           | Custom search request builder                                  |

### 3.6 Advanced Configuration

```java
QuestionAnswerAdvisor advisor = QuestionAnswerAdvisor.builder(vectorStore)
    .defaultTopK(10)                           // Retrieve top 10 documents
    .similarityThreshold(0.7)                   // Minimum 70% similarity
    .template("""
        Based on the following context, answer the question.

        Context: {context}

        Question: {question}

        If the context doesn't contain relevant information, say you don't know.
        """)
    .searchRequest(() -> SearchRequest.builder()
        .query("custom search query")
        .topK(5)
        .filterExpression(new EqualThan("category", "technical"))
        .build())
    .build();
```

---

## 4. RetrievalAugmentationAdvisor: Advanced Modular RAG

### 4.1 Overview

`RetrievalAugmentationAdvisor` is the **advanced, modular RAG implementation** that provides fine-grained control over each pipeline phase.

### 4.2 Core Components

```java
RetrievalAugmentationAdvisor.builder()
    .documentRetriever(vectorStoreDocumentRetriever)  // Required
    .queryTransformer(compressionQueryTransformer)    // Optional
    .queryExpander(multiQueryExpander)                // Optional
    .documentJoiner(concatenationDocumentJoiner)      // Optional
    .documentPostProcessor(rerankingDocumentPostProcessor) // Optional
    .queryAugmenter(contextualQueryAugmenter)         // Optional
    .responseAugmenter(myResponseAugmenter)            // Optional
    .build();
```

### 4.3 Full Configuration Example

```java
@Configuration
public class RagConfiguration {

    @Bean
    public RetrievalAugmentationAdvisor ragAdvisor(
            VectorStore vectorStore,
            DocumentRetriever documentRetriever,
            QueryTransformer queryTransformer,
            QueryExpander queryExpander,
            DocumentJoiner documentJoiner,
            DocumentPostProcessor documentPostProcessor,
            QueryAugmenter queryAugmenter) {

        return RetrievalAugmentationAdvisor.builder()
            .documentRetriever(documentRetriever)
            .queryTransformer(queryTransformer)        // Phase 1: Pre-Retrieval
            .queryExpander(queryExpander)               // Phase 1: Query Expansion
            .documentJoiner(documentJoiner)             // Phase 2: Combine Results
            .documentPostProcessor(documentPostProcessor) // Phase 2: Post-Process
            .queryAugmenter(queryAugmenter)             // Phase 3: Query Augmentation
            .build();
    }
}
```

### 4.4 Usage with ChatClient

```java
@Service
public class AdvancedRagService {

    private final ChatClient chatClient;
    private final RetrievalAugmentationAdvisor ragAdvisor;

    public AdvancedRagService(
            ChatClient.Builder chatClientBuilder,
            RetrievalAugmentationAdvisor ragAdvisor) {
        this.chatClient = chatClientBuilder.build();
        this.ragAdvisor = ragAdvisor;
    }

    public String answer(String question) {
        // Apply RAG advisor to the prompt
        Prompt prompt = new Prompt(new UserMessage(question));

        return chatClient.prompt(prompt)
            .advisors(ragAdvisor)  // Apply the modular RAG advisor
            .call()
            .content();
    }
}
```

---

## 5. Query Transformers

Query transformers modify the user's query before retrieval to improve search quality.

### 5.1 CompressionQueryTransformer

Compresses retrieved documents to extract only relevant passages.

```java
@Configuration
public class QueryTransformerConfig {

    @Bean
    public CompressionQueryTransformer compressionQueryTransformer(ChatClient chatClient) {
        return CompressionQueryTransformer.builder()
            .chatClient(chatClient)
            .template("""
                Compress the following context to extract only information relevant to: {query}

                Context: {context}

                Compressed Context:
                """)
            .build();
    }
}
```

### 5.2 RewriteQueryTransformer

Rewrites the user's query to improve retrieval effectiveness.

```java
@Configuration
public class QueryTransformerConfig {

    @Bean
    public RewriteQueryTransformer rewriteQueryTransformer(ChatClient chatClient) {
        return RewriteQueryTransformer.builder()
            .chatClient(chatClient)
            .template("""
                Rewrite the following query to be more effective for semantic search.
                Make it clearer, more specific, and include relevant synonyms.

                Original Query: {query}

                Rewritten Query:
                """)
            .build();
    }
}
```

### 5.3 TranslationQueryTransformer

Translates the query to match the language of stored documents.

```java
@Configuration
public class QueryTransformerConfig {

    @Bean
    public TranslationQueryTransformer translationQueryTransformer(ChatClient chatClient) {
        return TranslationQueryTransformer.builder()
            .chatClient(chatClient)
            .sourceLanguage(Language.AUTO)      // Detect source language
            .targetLanguage(Language.ENGLISH)    // Translate to English
            .template("""
                Translate the following text to English:

                {query}
                """)
            .build();
    }
}
```

### 5.4 Custom QueryTransformer

```java
public class CustomQueryTransformer implements QueryTransformer {

    @Override
    public String transform(String query, Map<String, Object> context) {
        // Custom transformation logic
        return query.toLowerCase()
            .replaceAll("[^a-z0-9\\s]", "")
            .trim();
    }
}
```

---

## 6. Query Expanders

Query expanders generate multiple query variants to improve recall.

### 6.1 MultiQueryExpander

Generates multiple semantically similar queries and retrieves documents for each.

```java
@Configuration
public class QueryExpanderConfig {

    @Bean
    public MultiQueryExpander multiQueryExpander(ChatClient chatClient) {
        return MultiQueryExpander.builder()
            .chatClient(chatClient)
            .template("""
                Generate 3 different versions of the following question
                to retrieve relevant documents via semantic search.

                Original Question: {query}

                Provide each version on a new line prefixed with "- ".
                """)
            .numberOfVersions(3)
            .build();
    }
}
```

### 6.2 MultiQueryExpander Options

| Option                | Type       | Default          | Description                                  |
| --------------------- | ---------- | ---------------- | -------------------------------------------- |
| `chatClient`          | ChatClient | Required         | LLM for generating query variants            |
| `template`            | String     | Default template | Prompt template                              |
| `numberOfVersions`    | int        | 3                | Number of query variants to generate         |
| `differenceThreshold` | double     | 0.0              | Minimum semantic difference between variants |

### 6.3 Custom QueryExpander

```java
public class KeywordExpansionQueryExpander implements QueryExpander {

    @Override
    public List<String> expand(String query, Map<String, Object> context) {
        // Add keyword variations
        List<String> expandedQueries = new ArrayList<>();
        expandedQueries.add(query);

        // Add synonyms
        expandedQueries.add(query.replace("error", "exception bug issue"));
        expandedQueries.add(query.replace("help", "assist support guide"));

        // Add related terms
        expandedQueries.add(query + " troubleshooting");

        return expandedQueries;
    }
}
```

---

## 7. Document Retriever

The document retriever fetches documents from a vector store.

### 7.1 VectorStoreDocumentRetriever

The most common implementation that queries a `VectorStore`.

```java
@Configuration
public class RetrieverConfig {

    @Bean
    public VectorStoreDocumentRetriever documentRetriever(VectorStore vectorStore) {
        return VectorStoreDocumentRetriever.builder()
            .vectorStore(vectorStore)
            .topK(5)                                    // Top 5 results
            .similarityThreshold(0.6)                   // Minimum similarity
            .filterExpression(null)                    // Optional filters
            .build();
    }
}
```

### 7.2 VectorStoreDocumentRetriever Options

| Option                | Type             | Default  | Description                     |
| --------------------- | ---------------- | -------- | ------------------------------- |
| `vectorStore`         | VectorStore      | Required | The vector store to query       |
| `topK`                | int              | 4        | Number of documents to retrieve |
| `similarityThreshold` | double           | 0.0      | Minimum similarity score        |
| `filterExpression`    | FilterExpression | null     | Metadata filters                |

### 7.3 Custom DocumentRetriever

```java
public class CustomDocumentRetriever implements DocumentRetriever {

    private final VectorStore vectorStore;
    private final EmbeddingModel embeddingModel;

    @Override
    public List<Document> retrieve(RetrievalRequest request) {
        // Custom retrieval logic
        Embedding embedding = embeddingModel.embed(request.query());

        SearchRequest searchRequest = SearchRequest.builder()
            .query(request.query())
            .topK(request.topK())
            .filterExpression(request.filterExpression())
            .build();

        return vectorStore.similaritySearch(searchRequest);
    }
}
```

---

## 8. Document Joiners

Document joiners combine results from multiple retrievers or query expansions.

### 8.1 ConcatenationDocumentJoiner

Simply concatenates all documents from multiple retrieval results.

```java
@Configuration
public class JoinerConfig {

    @Bean
    public ConcatenationDocumentJoiner concatenationDocumentJoiner() {
        return new ConcatenationDocumentJoiner();
    }
}
```

### 8.2 Custom DocumentJoiner

```java
public class DeduplicatingDocumentJoiner implements DocumentJoiner {

    @Override
    public List<Document> join(List<List<Document>> documentLists) {
        // Deduplicate by content
        Set<String> seenContent = new HashSet<>();
        List<Document> deduplicated = new ArrayList<>();

        for (List<Document> docs : documentLists) {
            for (Document doc : docs) {
                String contentHash = doc.getContent().hashCode() + "";
                if (!seenContent.contains(contentHash)) {
                    seenContent.add(contentHash);
                    deduplicated.add(doc);
                }
            }
        }

        return deduplicated;
    }
}
```

### 8.3 ReciprocalRankJoiner

Reranks documents based on reciprocal rank fusion.

```java
public class ReciprocalRankDocumentJoiner implements DocumentJoiner {

    private final double rrfConstant; // Usually 60

    public ReciprocalRankDocumentJoiner(double rrfConstant) {
        this.rrfConstant = rrfConstant;
    }

    @Override
    public List<Document> join(List<List<Document>> documentLists) {
        // Calculate RRF scores for each document
        Map<String, Double> scores = new HashMap<>();

        for (List<Document> docs : documentLists) {
            for (int rank = 0; rank < docs.size(); rank++) {
                String id = docs.get(rank).getId();
                double rrfScore = rrfConstant / (rrfConstant + rank + 1);
                scores.merge(id, rrfScore, Double::sum);
            }
        }

        // Sort by RRF score and return
        return scores.entrySet().stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .map(e -> findDocumentById(e.getKey(), documentLists))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
}
```

---

## 9. Query Augmenters

Query augmenters add context to the query before it's sent to the LLM.

### 9.1 ContextualQueryAugmenter

Adds retrieved documents directly to the query context.

```java
@Configuration
public class QueryAugmenterConfig {

    @Bean
    public ContextualQueryAugmenter contextualQueryAugmenter() {
        return ContextualQueryAugmenter.builder()
            .template("""
                Use the following context to answer the question.

                Context:
                {context}

                Question: {query}
                """)
            .build();
    }
}
```

### 9.2 ContextualQueryAugmenter Options

| Option            | Type    | Default          | Description                                    |
| ----------------- | ------- | ---------------- | ---------------------------------------------- |
| `template`        | String  | Default template | Prompt template with `{query}` and `{context}` |
| `contextLength`   | int     | 2000             | Maximum context length (tokens)                |
| `includeRawQuery` | boolean | true             | Include original query in template             |

### 9.3 Custom QueryAugmenter

```java
public class CustomQueryAugmenter implements QueryAugmenter {

    @Override
    public Prompt augment(Prompt prompt, List<Document> documents) {
        // Build context from documents
        String context = documents.stream()
            .map(doc -> String.format("[Source: %s]\n%s",
                doc.getMetadata().get("source"),
                doc.getContent()))
            .collect(Collectors.joining("\n\n"));

        // Create augmented prompt
        String augmentedQuery = String.format("""
            Based on the following context, answer the question.

            Context:
            %s

            Question: %s
            """, context, prompt.getUserMessage().getText());

        return new Prompt(new UserMessage(augmentedQuery));
    }
}
```

---

## 10. Document Post-Processors

Post-processors refine retrieved documents before they're used in the prompt.

### 10.1 Re-ranking Document Post-Processor

Reranks documents using a cross-encoder model for better relevance scoring.

```java
@Configuration
public class PostProcessorConfig {

    @Bean
    public RerankingDocumentPostProcessor rerankingProcessor(
            VectorStore vectorStore,
            EmbeddingModel embeddingModel) {

        return RerankingDocumentPostProcessor.builder()
            .documentRetriever(VectorStoreDocumentRetriever.builder()
                .vectorStore(vectorStore)
                .topK(20)  // Retrieve more than needed for reranking
                .build())
            .embeddingModel(embeddingModel)
            .topK(5)           // Return top 5 after reranking
            .build();
    }
}
```

### 10.2 Custom Document Post-Processor

```java
public class LengthBasedDocumentPostProcessor implements DocumentPostProcessor {

    private final int maxTotalLength;

    public LengthBasedDocumentPostProcessor(int maxTotalLength) {
        this.maxTotalLength = maxTotalLength;
    }

    @Override
    public List<Document> process(List<Document> documents, String query) {
        List<Document> selected = new ArrayList<>();
        int totalLength = 0;

        // Select documents until max length reached
        for (Document doc : documents) {
            int docLength = doc.getContent().length();
            if (totalLength + docLength <= maxTotalLength) {
                selected.add(doc);
                totalLength += docLength;
            } else {
                break;
            }
        }

        return selected;
    }
}
```

### 10.3 Document Post-Processor Types

| Type                                 | Description                                      |
| ------------------------------------ | ------------------------------------------------ |
| `RerankingDocumentPostProcessor`     | Uses cross-encoder for precise relevance scoring |
| `CompressionDocumentPostProcessor`   | Uses LLM to compress document content            |
| `LengthBasedDocumentPostProcessor`   | Limits total context length                      |
| `DeduplicationDocumentPostProcessor` | Removes duplicate documents                      |

---

## 11. Filter Expressions

Filter expressions enable dynamic and metadata-based filtering during retrieval.

### 11.1 FilterExpression Overview

Spring AI provides a fluent API for building filter expressions:

```java
import org.springframework.ai.vectorstore.filter.FilterExpression;
import static org.springframework.ai.vectorstore.filter.FilterExpression.*;
```

### 11.2 Basic Filter Operators

```java
// Equality
FilterExpression eq = eq("category", "technical");

// Not Equal
FilterExpression ne = ne("status", "archived");

// Greater Than
FilterExpression gt = gt("price", 100);

// Greater Than or Equal
FilterExpression gte = gte("rating", 4.5);

// Less Than
FilterExpression lt = lt("stock", 10);

// Less Than or Equal
FilterExpression lte = lte("priority", 3);
```

### 11.3 Logical Operators

```java
// AND
FilterExpression and = and(
    eq("category", "technical"),
    gte("rating", 4.0)
);

// OR
FilterExpression or = or(
    eq("author", "John Doe"),
    eq("author", "Jane Smith")
);

// NOT
FilterExpression not = not(eq("status", "deleted"));
```

### 11.4 String Operations

```java
// Contains (substring)
FilterExpression contains = contains("title", "Spring");

// Starts With
FilterExpression startsWith = startsWith("email", "admin");

// In (multiple values)
FilterExpression in = in("status", "active", "pending", "processing");
```

### 11.5 Applying Filters in Retriever

```java
@Configuration
public class FilterConfig {

    @Bean
    public VectorStoreDocumentRetriever filteredRetriever(VectorStore vectorStore) {
        // Build complex filter expression
        FilterExpression filter = and(
            or(
                eq("category", "technical"),
                eq("category", "documentation")
            ),
            gte("rating", 4.0),
            not(eq("status", "archived"))
        );

        return VectorStoreDocumentRetriever.builder()
            .vectorStore(vectorStore)
            .topK(10)
            .filterExpression(filter)
            .build();
    }
}
```

### 11.6 Dynamic Filter from Request

```java
public List<Document> searchWithFilters(
        String query,
        String category,
        Double minRating) {

    // Build filter dynamically
    FilterExpression.Builder builder = new FilterExpression.Builder();
    List<FilterExpression> conditions = new ArrayList<>();

    if (category != null) {
        conditions.add(eq("category", category));
    }
    if (minRating != null) {
        conditions.add(gte("rating", minRating));
    }

    FilterExpression filter = conditions.isEmpty()
        ? null
        : and(conditions.toArray(new FilterExpression[0]));

    SearchRequest request = SearchRequest.builder()
        .query(query)
        .topK(10)
        .filterExpression(filter)
        .build();

    return vectorStore.similaritySearch(request);
}
```

---

## 12. Complete Example: End-to-End RAG Pipeline

### 12.1 Project Setup

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.4.0</version>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>spring-ai-rag-demo</artifactId>
    <version>1.0.0</version>

    <dependencies>
        <!-- Spring AI -->
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
        </dependency>

        <!-- Vector Store -->
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-starter-vector-store-pgvector</artifactId>
        </dependency>

        <!-- PostgreSQL -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
    </dependencies>
</project>
```

### 12.2 Configuration

```yaml
# application.yaml
spring:
  application:
    name: spring-ai-rag-demo

  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      chat:
        options:
          model: gpt-4o

  datasource:
    url: jdbc:postgresql://localhost:5432/vectordb
    username: postgres
    password: ${DB_PASSWORD}

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false

  ai:
    vectorstore:
      pgvector:
        dimensions: 1536
```

### 12.3 Document Entity and Repository

```java
// Document.java - Domain entity for knowledge base
@Entity
@Table(name = "knowledge_documents")
public class KnowledgeDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String content;
    private String category;
    private String author;
    private LocalDateTime createdAt;

    // Constructors
    public KnowledgeDocument() {}

    public KnowledgeDocument(String title, String content, String category, String author) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.author = author;
        this.createdAt = LocalDateTime.now();
    }

    // Convert to Spring AI Document
    public Document toSpringDocument() {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("id", this.id);
        metadata.put("title", this.title);
        metadata.put("category", this.category);
        metadata.put("author", this.author);
        metadata.put("createdAt", this.createdAt.toString());

        return new Document(
            String.format("%s\n\n%s", this.title, this.content),
            metadata
        );
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
```

### 12.4 Vector Store Configuration

```java
@Configuration
public class VectorStoreConfig {

    @Bean
    public VectorStore vectorStore(JdbcTemplate jdbcTemplate, EmbeddingModel embeddingModel) {
        return PgVectorStore.builder(jdbcTemplate, embeddingModel)
            .tableName("vector_store")
            .dimensions(1536)
            .initializeSchema(true)
            .build();
    }
}
```

### 12.5 RAG Pipeline Components

```java
@Configuration
public class RagPipelineConfig {

    @Autowired
    private VectorStore vectorStore;

    @Autowired
    private ChatClient.Builder chatClientBuilder;

    // Document Retriever
    @Bean
    public VectorStoreDocumentRetriever documentRetriever() {
        return VectorStoreDocumentRetriever.builder()
            .vectorStore(vectorStore)
            .topK(5)
            .similarityThreshold(0.6)
            .build();
    }

    // Query Transformer
    @Bean
    public CompressionQueryTransformer compressionQueryTransformer() {
        return CompressionQueryTransformer.builder()
            .chatClient(chatClientBuilder.build())
            .build();
    }

    // Query Expander
    @Bean
    public MultiQueryExpander multiQueryExpander() {
        return MultiQueryExpander.builder()
            .chatClient(chatClientBuilder.build())
            .numberOfVersions(3)
            .build();
    }

    // Document Joiner
    @Bean
    public ConcatenationDocumentJoiner concatenationDocumentJoiner() {
        return new ConcatenationDocumentJoiner();
    }

    // Query Augmenter
    @Bean
    public ContextualQueryAugmenter contextualQueryAugmenter() {
        return ContextualQueryAugmenter.builder()
            .template("""
                Use the following context to answer the question.
                If the context doesn't contain relevant information, say you don't know.

                Context:
                {context}

                Question: {query}
                """)
            .build();
    }

    // Complete RAG Advisor
    @Bean
    public RetrievalAugmentationAdvisor ragAdvisor(
            DocumentRetriever documentRetriever,
            QueryTransformer queryTransformer,
            QueryExpander queryExpander,
            DocumentJoiner documentJoiner,
            QueryAugmenter queryAugmenter) {

        return RetrievalAugmentationAdvisor.builder()
            .documentRetriever(documentRetriever)
            .queryTransformer(queryTransformer)
            .queryExpander(queryExpander)
            .documentJoiner(documentJoiner)
            .queryAugmenter(queryAugmenter)
            .build();
    }
}
```

### 12.6 RAG Service

```java
@Service
@Slf4j
public class RagService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    private final RetrievalAugmentationAdvisor ragAdvisor;

    public RagService(
            ChatClient.Builder chatClientBuilder,
            VectorStore vectorStore,
            RetrievalAugmentationAdvisor ragAdvisor) {
        this.chatClient = chatClientBuilder.build();
        this.vectorStore = vectorStore;
        this.ragAdvisor = ragAdvisor;
    }

    /**
     * Answer a question using RAG
     */
    public String answerQuestion(String question) {
        log.info("Answering question: {}", question);

        Prompt prompt = new Prompt(new UserMessage(question));

        return chatClient.prompt(prompt)
            .advisors(ragAdvisor)
            .call()
            .content();
    }

    /**
     * Answer with category filter
     */
    public String answerQuestionInCategory(String question, String category) {
        // Create filtered retriever
        FilterExpression filter = eq("category", category);

        VectorStoreDocumentRetriever filteredRetriever =
            VectorStoreDocumentRetriever.builder()
                .vectorStore(vectorStore)
                .topK(5)
                .filterExpression(filter)
                .build();

        // Create temporary advisor with filter
        RetrievalAugmentationAdvisor filteredAdvisor =
            RetrievalAugmentationAdvisor.builder()
                .documentRetriever(filteredRetriever)
                .build();

        Prompt prompt = new Prompt(new UserMessage(question));

        return chatClient.prompt(prompt)
            .advisors(filteredAdvisor)
            .call()
            .content();
    }

    /**
     * Answer with advanced pipeline (compression + expansion)
     */
    public String answerQuestionAdvanced(String question) {
        log.info("Answering advanced question: {}", question);

        // Build custom advisor with all components
        RetrievalAugmentationAdvisor advancedAdvisor =
            RetrievalAugmentationAdvisor.builder()
                .documentRetriever(VectorStoreDocumentRetriever.builder()
                    .vectorStore(vectorStore)
                    .topK(10)
                    .build())
                .queryExpander(MultiQueryExpander.builder()
                    .chatClient(chatClient)
                    .numberOfVersions(3)
                    .build())
                .documentJoiner(new ConcatenationDocumentJoiner())
                .queryTransformer(new CompressionQueryTransformer(chatClient))
                .queryAugmenter(ContextualQueryAugmenter.builder()
                    .template("""
                        Based on the following retrieved documents, provide a comprehensive answer.

                        Documents:
                        {context}

                        Question: {query}

                        Provide a clear, concise answer citing sources when possible.
                        """)
                    .build())
                .build();

        Prompt prompt = new Prompt(new UserMessage(question));

        return chatClient.prompt(prompt)
            .advisors(advancedAdvisor)
            .call()
            .content();
    }
}
```

### 12.7 Document Ingestion Service

```java
@Service
@Slf4j
public class DocumentIngestionService {

    private final VectorStore vectorStore;

    public DocumentIngestionService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    /**
     * Add documents to the vector store
     */
    public void addDocuments(List<KnowledgeDocument> documents) {
        List<Document> springDocs = documents.stream()
            .map(KnowledgeDocument::toSpringDocument)
            .toList();

        vectorStore.add(springDocs);
        log.info("Added {} documents to vector store", documents.size());
    }

    /**
     * Add a single document
     */
    public void addDocument(KnowledgeDocument document) {
        addDocuments(List.of(document));
    }

    /**
     * Delete documents by ID
     */
    public void deleteDocuments(List<String> ids) {
        vectorStore.delete(ids);
        log.info("Deleted {} documents from vector store", ids.size());
    }

    /**
     * Search documents directly (without LLM)
     */
    public List<Document> search(String query, int topK) {
        SearchRequest request = SearchRequest.builder()
            .query(query)
            .topK(topK)
            .build();

        return vectorStore.similaritySearch(request);
    }
}
```

### 12.8 REST Controller

```java
@RestController
@RequestMapping("/api/rag")
@RequiredArgsConstructor
@Slf4j
public class RagController {

    private final RagService ragService;
    private final DocumentIngestionService ingestionService;
    private final VectorStore vectorStore;

    /**
     * Ask a question using RAG
     */
    @PostMapping("/ask")
    public ResponseEntity<Map<String, String>> askQuestion(@RequestBody AskRequest request) {
        log.info("Received question: {}", request.question());

        String answer = ragService.answerQuestion(request.question());

        return ResponseEntity.ok(Map.of(
            "question", request.question(),
            "answer", answer
        ));
    }

    /**
     * Ask with category filter
     */
    @PostMapping("/ask/category")
    public ResponseEntity<Map<String, String>> askWithCategory(
            @RequestBody AskCategoryRequest request) {

        String answer = ragService.answerQuestionInCategory(
            request.question(),
            request.category()
        );

        return ResponseEntity.ok(Map.of(
            "question", request.question(),
            "category", request.category(),
            "answer", answer
        ));
    }

    /**
     * Add documents to the knowledge base
     */
    @PostMapping("/documents")
    public ResponseEntity<Map<String, Object>> addDocuments(
            @RequestBody List<KnowledgeDocument> documents) {

        ingestionService.addDocuments(documents);

        return ResponseEntity.ok(Map.of(
            "message", "Documents added successfully",
            "count", documents.size()
        ));
    }

    /**
     * Search documents
     */
    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> search(
            @RequestBody SearchRequestDto request) {

        List<Document> results = ingestionService.search(
            request.query(),
            request.topK()
        );

        List<Map<String, Object>> docResults = results.stream()
            .map(doc -> Map.<String, Object>of(
                "content", doc.getContent(),
                "metadata", doc.getMetadata()
            ))
            .toList();

        return ResponseEntity.ok(Map.of(
            "query", request.query(),
            "results", docResults
        ));
    }

    // Request DTOs
    public record AskRequest(String question) {}
    public record AskCategoryRequest(String question, String category) {}
    public record SearchRequestDto(String query, int topK) {}
}
```

### 12.9 Usage Example

```java
// Sample usage in tests or main method
@SpringBootApplication
public class RagDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(RagDemoApplication.class, args);
    }

    @Autowired
    private CommandLineRunner runner;

    @Bean
    public CommandLineRunner demo(RagService ragService,
                                   DocumentIngestionService ingestionService) {
        return args -> {
            // 1. Add sample documents
            List<KnowledgeDocument> docs = List.of(
                new KnowledgeDocument(
                    "Spring AI Overview",
                    "Spring AI is an AI framework that provides abstractions for AI development...",
                    "documentation",
                    "Spring Team"
                ),
                new KnowledgeDocument(
                    "RAG Implementation Guide",
                    "Retrieval Augmented Generation (RAG) combines retrieval with generation...",
                    "technical",
                    "AI Expert"
                ),
                new KnowledgeDocument(
                    "Vector Store Configuration",
                    "Vector stores enable semantic search over documents...",
                    "technical",
                    "DevOps Team"
                )
            );

            ingestionService.addDocuments(docs);

            // 2. Ask questions
            String answer1 = ragService.answerQuestion(
                "What is Spring AI?"
            );
            System.out.println("Answer 1: " + answer1);

            String answer2 = ragService.answerQuestionInCategory(
                "How does RAG work?",
                "technical"
            );
            System.out.println("Answer 2: " + answer2);
        };
    }
}
```

---

## Summary: RAG Component Selection Guide

| Scenario              | Recommended Components                            |
| --------------------- | ------------------------------------------------- |
| **Simple Q&A**        | `QuestionAnswerAdvisor` only                      |
| **Better accuracy**   | Add `CompressionQueryTransformer`                 |
| **Higher recall**     | Add `MultiQueryExpander`                          |
| **Large documents**   | Add `RerankingDocumentPostProcessor`              |
| **Multi-source**      | Multiple retrievers + `DocumentJoiner`            |
| **Multilingual**      | Add `TranslationQueryTransformer`                 |
| **Dynamic filtering** | Use `FilterExpression` in retriever               |
| **Full pipeline**     | All components via `RetrievalAugmentationAdvisor` |

---

## References

- [Spring AI Documentation](https://docs.spring.io/spring-ai/reference/)
- [Spring AI GitHub](https://github.com/spring-projects/spring-ai)
- [Vector Stores](https://docs.spring.io/spring-ai/reference/1.0/vectorstores.html)
- [RAG Pipeline](https://docs.spring.io/spring-ai/reference/1.0/rag.html)
