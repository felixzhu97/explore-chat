import { PrismaService } from "@/core/database/prisma.service";

/**
 * Infra-only Prisma repository base. Domain must not depend on PrismaClient.
 * Subclasses own concrete delegates (message, chat, …).
 */
export abstract class AbstractPrismaRepository {
  protected constructor(protected readonly prisma: PrismaService) {}
}
