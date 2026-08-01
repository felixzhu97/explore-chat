# DDD Rich Model (WhatsFeed)

Aligned with [architecture rule](../../../rules/architecture.mdc).

## Rich vs anemic

| Rich (preferred)                                  | Anemic (avoid)                                 |
| ------------------------------------------------- | ---------------------------------------------- |
| Entity methods enforce invariants                 | Entity is only fields + getters                |
| Use case loads aggregate, calls domain API, saves | Use case contains all if/else business rules   |
| VO validates on construction                      | Primitives passed everywhere (`string postId`) |

## Patterns

### Entity / Aggregate (TypeScript)

```typescript
export class Post {
  private constructor(
    readonly id: PostId,
    private status: PostStatus,
  ) {}

  static create(id: PostId): Post {
    return new Post(id, PostStatus.Active);
  }

  archive(): void {
    if (this.status === PostStatus.Archived) {
      throw new Error(`Post already archived: ${this.id.value}`);
    }
    this.status = PostStatus.Archived;
  }
}
```

### Value Object

```typescript
export class PostId {
  private constructor(readonly value: string) {
    if (!value) throw new Error("PostId required");
  }

  static of(value: string): PostId {
    return new PostId(value);
  }
}
```

### Repository

```typescript
// domain/
export interface PostRepository {
  findById(id: PostId): Promise<Post | null>;
  save(post: Post): Promise<void>;
}
```

Implementation lives in `infrastructure/` only.

### Use Case (orchestration)

```typescript
async archivePost(postId: string): Promise<void> {
  const id = PostId.of(postId);
  const post = await this.postRepository.findById(id);
  if (!post) throw new NotFoundException();
  post.archive();
  await this.postRepository.save(post);
}
```

Business rules like “cannot archive twice” stay on `Post`, not in the use case.

## Ubiquitous language

Source of truth: [docs/Glossary.md](../../../../docs/Glossary.md)

- Name **types, variables, and methods** with the glossary **Preferred Term (English)** for that bounded context
- Keep the **same** terms in BDD scenarios, unit tests, domain code, REST/DTO fields, and commits
- New concept workflow: glossary entry → domain model → API / i18n → PR references glossary change
- Ownership: developer implements Preferred Terms; domain-expert guards consistency
