import { Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { MongoService } from "./mongo.service";

export interface CommentDoc {
  _id?: ObjectId;
  postId: string;
  userId: string;
  content: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MongoCommentRepository {
  private get collection() {
    const db = this.mongo.getDb();
    return db?.collection<CommentDoc>("comments") ?? null;
  }

  constructor(private readonly mongo: MongoService) {}

  async insert(
    doc: Omit<CommentDoc, "_id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const col = this.collection;
    if (!col) throw new Error("MongoDB not connected");
    const now = new Date();
    const result = await col.insertOne({
      ...doc,
      createdAt: now,
      updatedAt: now,
    });
    return result.insertedId.toString();
  }

  async findByPostId(
    postId: string,
    limit: number,
    skip: number,
  ): Promise<CommentDoc[]> {
    const col = this.collection;
    if (!col) return [];
    const cursor = col
      .find({ postId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return cursor.toArray();
  }

  async findById(id: string): Promise<CommentDoc | null> {
    const col = this.collection;
    if (!col) return null;
    let oid: ObjectId;
    try {
      oid = new ObjectId(id);
    } catch {
      return null;
    }
    return col.findOne({ _id: oid });
  }

  async deleteOne(id: string, userId: string): Promise<boolean> {
    const col = this.collection;
    if (!col) return false;
    let oid: ObjectId;
    try {
      oid = new ObjectId(id);
    } catch {
      return false;
    }
    const result = await col.deleteOne({ _id: oid, userId });
    return result.deletedCount === 1;
  }
}
