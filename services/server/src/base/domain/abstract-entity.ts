import { AbstractImmutable } from "./abstract-immutable";

/**
 * Mutable entity kernel: updatedAt + planned optimistic version.
 * version is not persisted until a schema migration adds it.
 */
export abstract class AbstractEntity extends AbstractImmutable {
  protected constructor(
    id: string,
    createdAt: Date,
    readonly updatedAt: Date,
    readonly version: number = 0,
  ) {
    super(id, createdAt);
  }
}
