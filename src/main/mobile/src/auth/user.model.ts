import type { User as DomainUser } from "@/core/im/user";
import { toOptionalDate, toRequiredDate } from "@/shared/value-coercion";

export interface User extends DomainUser {
  name: string;
  phoneNumber: string;
  isTyping: boolean;
}

export class UserEntity implements User {
  id: string;
  name: string;
  phoneNumber: string;
  profilePicture?: string;
  about?: string;
  lastSeen?: Date;
  isOnline: boolean;
  isTyping: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: User) {
    this.id = data.id;
    this.name = data.name;
    this.phoneNumber = data.phoneNumber;
    this.profilePicture = data.profilePicture;
    this.about = data.about ?? "嗨，我正在使用 Chat！";
    this.lastSeen = toOptionalDate(data.lastSeen);
    this.isOnline = data.isOnline ?? false;
    this.isTyping = data.isTyping ?? false;
    this.createdAt = toRequiredDate(data.createdAt);
    this.updatedAt = toRequiredDate(data.updatedAt);
  }

  copyWith(updates: Partial<User>): UserEntity {
    return new UserEntity({
      id: updates.id ?? this.id,
      name: updates.name ?? this.name,
      phoneNumber: updates.phoneNumber ?? this.phoneNumber,
      profilePicture: updates.profilePicture ?? this.profilePicture,
      about: updates.about ?? this.about,
      lastSeen: updates.lastSeen ?? this.lastSeen,
      isOnline: updates.isOnline ?? this.isOnline,
      isTyping: updates.isTyping ?? this.isTyping,
      createdAt: updates.createdAt ?? this.createdAt,
      updatedAt: updates.updatedAt ?? this.updatedAt,
    });
  }

  toMap(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      phoneNumber: this.phoneNumber,
      profilePicture: this.profilePicture,
      about: this.about,
      lastSeen: this.lastSeen?.getTime(),
      isOnline: this.isOnline,
      isTyping: this.isTyping,
      createdAt: this.createdAt.getTime(),
      updatedAt: this.updatedAt.getTime(),
    };
  }

  static fromMap(map: Record<string, unknown>): UserEntity {
    return new UserEntity({
      id: (map.id as string) ?? "",
      name: (map.name as string) ?? "",
      phoneNumber: (map.phoneNumber as string) ?? "",
      profilePicture: map.profilePicture as string | undefined,
      about: map.about as string | undefined,
      lastSeen: map.lastSeen ? new Date(map.lastSeen as number) : undefined,
      isOnline: (map.isOnline as boolean) ?? false,
      isTyping: (map.isTyping as boolean) ?? false,
      createdAt: new Date(map.createdAt as number),
      updatedAt: new Date(map.updatedAt as number),
    });
  }

  toString(): string {
    return `User(id: ${this.id}, name: ${this.name}, phoneNumber: ${this.phoneNumber}, isOnline: ${this.isOnline})`;
  }

  equals(other: User): boolean {
    return this.id === other.id;
  }
}
