import { AbstractEntity } from "./abstract-entity";

export type ParticipantRole = "ADMIN" | "MEMBER";

/**
 * Shared membership shape for Chat / Group participants.
 */
export abstract class AbstractParticipant extends AbstractEntity {
  protected constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    readonly userId: string,
    readonly role: ParticipantRole,
    readonly joinedAt: Date,
    readonly addedBy?: string,
    version: number = 0,
  ) {
    super(id, createdAt, updatedAt, version);
  }
}
