/**
 * Immutable identity + creation time (Prisma cuid / createdAt).
 */
export abstract class AbstractImmutable {
  protected constructor(
    readonly id: string,
    readonly createdAt: Date,
  ) {}
}
