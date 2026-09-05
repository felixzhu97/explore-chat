export type ParticipantRole = "ADMIN" | "MEMBER";

export interface GroupParticipant {
  userId: string;
  role: ParticipantRole;
  joinedAt: Date;
  addedBy?: string;
}

export interface GroupSettings {
  onlyAdminsCanSendMessages: boolean;
  onlyAdminsCanEditInfo: boolean;
  onlyAdminsCanAddParticipants: boolean;
}

export class Group {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly creatorId: string,
    public readonly description?: string,
    public readonly avatar?: string,
    public readonly participants: GroupParticipant[] = [],
    public readonly settings: GroupSettings = {
      onlyAdminsCanSendMessages: false,
      onlyAdminsCanEditInfo: false,
      onlyAdminsCanAddParticipants: false,
    },
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(data: {
    id: string;
    name: string;
    description?: string;
    avatar?: string;
    creatorId: string;
    participants?: GroupParticipant[];
    settings?: GroupSettings;
    createdAt?: Date;
    updatedAt?: Date;
  }): Group {
    return new Group(
      data.id,
      data.name,
      data.creatorId,
      data.description,
      data.avatar,
      data.participants ?? [],
      data.settings ?? {
        onlyAdminsCanSendMessages: false,
        onlyAdminsCanEditInfo: false,
        onlyAdminsCanAddParticipants: false,
      },
      data.createdAt ?? new Date(),
      data.updatedAt ?? new Date(),
    );
  }

  addParticipant(
    userId: string,
    addedBy: string,
    role: ParticipantRole = "MEMBER",
  ): Group {
    const existingParticipant = this.participants.find(
      (p) => p.userId === userId,
    );
    if (existingParticipant) {
      return this;
    }

    return new Group(
      this.id,
      this.name,
      this.creatorId,
      this.description,
      this.avatar,
      [
        ...this.participants,
        {
          userId,
          role,
          joinedAt: new Date(),
          addedBy,
        },
      ],
      this.settings,
      this.createdAt,
      new Date(),
    );
  }

  removeParticipant(userId: string): Group {
    return new Group(
      this.id,
      this.name,
      this.creatorId,
      this.description,
      this.avatar,
      this.participants.filter((p) => p.userId !== userId),
      this.settings,
      this.createdAt,
      new Date(),
    );
  }

  promoteToAdmin(userId: string): Group {
    return new Group(
      this.id,
      this.name,
      this.creatorId,
      this.description,
      this.avatar,
      this.participants.map((p) =>
        p.userId === userId ? { ...p, role: "ADMIN" as ParticipantRole } : p,
      ),
      this.settings,
      this.createdAt,
      new Date(),
    );
  }
}
