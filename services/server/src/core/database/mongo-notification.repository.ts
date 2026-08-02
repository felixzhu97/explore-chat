import { Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { MongoService } from "./mongo.service";

export type NotificationType = "like" | "comment";

export interface NotificationDoc {
  _id?: ObjectId;
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId: string;
  commentId?: string;
  contentPreview?: string;
  createdAt: Date;
  readAt?: Date;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId: string;
  commentId?: string;
  contentPreview?: string;
  createdAt: string;
  readAt?: string;
}

function docToItem(doc: NotificationDoc): NotificationItem {
  const id = doc._id?.toString() ?? "";
  const item: NotificationItem = {
    id,
    recipientId: doc.recipientId,
    actorId: doc.actorId,
    type: doc.type,
    postId: doc.postId,
    createdAt: doc.createdAt.toISOString(),
  };
  if (doc.commentId !== undefined) item.commentId = doc.commentId;
  if (doc.contentPreview !== undefined)
    item.contentPreview = doc.contentPreview;
  if (doc.readAt !== undefined) item.readAt = doc.readAt.toISOString();
  return item;
}

function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(
    JSON.stringify({ t: createdAt.getTime(), id }),
    "utf8",
  ).toString("base64url");
}

function decodeCursor(cursor: string): { t: number; id: string } | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const o = JSON.parse(raw) as { t?: number; id?: string };
    if (typeof o.t !== "number" || typeof o.id !== "string") return null;
    return { t: o.t, id: o.id };
  } catch {
    return null;
  }
}

@Injectable()
export class MongoNotificationRepository {
  private get collection() {
    const db = this.mongo.getDb();
    return db?.collection<NotificationDoc>("notifications") ?? null;
  }

  constructor(private readonly mongo: MongoService) {}

  async upsertLike(
    recipientId: string,
    actorId: string,
    postId: string,
  ): Promise<NotificationItem | null> {
    const col = this.collection;
    if (!col) return null;
    const now = new Date();
    await col.updateOne(
      { recipientId, actorId, postId, type: "like" },
      {
        $set: { createdAt: now },
        $unset: { readAt: "" },
        $setOnInsert: { recipientId, actorId, postId, type: "like" as const },
      },
      { upsert: true },
    );
    const doc = await col.findOne({
      recipientId,
      actorId,
      postId,
      type: "like",
    });
    if (!doc) return null;
    return docToItem(doc as NotificationDoc);
  }

  async deleteLike(actorId: string, postId: string): Promise<boolean> {
    const col = this.collection;
    if (!col) return false;
    const result = await col.deleteOne({ actorId, postId, type: "like" });
    return result.deletedCount === 1;
  }

  async insertComment(
    recipientId: string,
    actorId: string,
    postId: string,
    commentId: string,
    contentPreview?: string,
  ): Promise<NotificationItem | null> {
    const col = this.collection;
    if (!col) return null;
    const now = new Date();
    const doc: Omit<NotificationDoc, "_id"> = {
      recipientId,
      actorId,
      type: "comment",
      postId,
      commentId,
      createdAt: now,
      ...(contentPreview !== undefined && { contentPreview }),
    };
    const result = await col.insertOne(doc as NotificationDoc);
    const inserted = await col.findOne({ _id: result.insertedId });
    if (!inserted) return null;
    return docToItem(inserted as NotificationDoc);
  }

  async deleteByCommentId(commentId: string): Promise<boolean> {
    const col = this.collection;
    if (!col) return false;
    const result = await col.deleteOne({ commentId, type: "comment" });
    return result.deletedCount === 1;
  }

  async findByRecipient(
    recipientId: string,
    limit: number,
    cursor?: string,
  ): Promise<{ items: NotificationItem[]; nextCursor?: string }> {
    const col = this.collection;
    if (!col) return { items: [] };
    const decoded = cursor ? decodeCursor(cursor) : null;
    const filter: Record<string, unknown> = { recipientId };
    if (decoded) {
      const cursorDate = new Date(decoded.t);
      const cursorOid = new ObjectId(decoded.id);
      filter["$or"] = [
        { createdAt: { $lt: cursorDate } },
        { $and: [{ createdAt: cursorDate }, { _id: { $lt: cursorOid } }] },
      ];
    }
    const cursorSort = col
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1);
    const rows = await cursorSort.toArray();
    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;
    const items = slice.map((d) => docToItem(d as NotificationDoc));
    const out: { items: NotificationItem[]; nextCursor?: string } = { items };
    if (hasMore && slice.length > 0) {
      const last = slice[slice.length - 1] as NotificationDoc;
      if (last._id && last.createdAt) {
        out.nextCursor = encodeCursor(last.createdAt, last._id.toString());
      }
    }
    return out;
  }

  async markRead(recipientId: string, id: string): Promise<boolean> {
    const col = this.collection;
    if (!col) return false;
    let oid: ObjectId;
    try {
      oid = new ObjectId(id);
    } catch {
      return false;
    }
    const now = new Date();
    const result = await col.updateOne(
      { _id: oid, recipientId },
      { $set: { readAt: now } },
    );
    return result.modifiedCount === 1 || result.matchedCount === 1;
  }

  async markReadMany(recipientId: string, ids: string[]): Promise<number> {
    const col = this.collection;
    if (!col || ids.length === 0) return 0;
    const oids: ObjectId[] = [];
    for (const id of ids) {
      try {
        oids.push(new ObjectId(id));
      } catch {
        continue;
      }
    }
    if (oids.length === 0) return 0;
    const now = new Date();
    const result = await col.updateMany(
      { recipientId, _id: { $in: oids } },
      { $set: { readAt: now } },
    );
    return result.modifiedCount;
  }

  async markAllRead(recipientId: string): Promise<number> {
    const col = this.collection;
    if (!col) return 0;
    const now = new Date();
    const result = await col.updateMany(
      { recipientId, readAt: { $exists: false } },
      { $set: { readAt: now } },
    );
    return result.modifiedCount;
  }
}
