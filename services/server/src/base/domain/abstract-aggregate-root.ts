import { AbstractEntity } from "./abstract-entity";

/**
 * Consistency-boundary marker for aggregates
 * (User / Chat / Message / Group / Post).
 */
export abstract class AbstractAggregateRoot extends AbstractEntity {
  protected constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    version: number = 0,
  ) {
    super(id, createdAt, updatedAt, version);
  }
}
