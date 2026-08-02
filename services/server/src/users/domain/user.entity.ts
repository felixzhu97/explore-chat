export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly phone?: string,
    public readonly avatar?: string,
    public readonly status?: string,
    public readonly isOnline: boolean = false,
    public readonly lastSeen: Date = new Date(),
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(data: {
    id: string;
    username: string;
    email: string;
    phone?: string;
    avatar?: string;
    status?: string;
    isOnline?: boolean;
    lastSeen?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }): User {
    return new User(
      data.id,
      data.username,
      data.email,
      data.phone,
      data.avatar,
      data.status,
      data.isOnline ?? false,
      data.lastSeen ?? new Date(),
      data.createdAt ?? new Date(),
      data.updatedAt ?? new Date(),
    );
  }

  updateStatus(status: string): User {
    return new User(
      this.id,
      this.username,
      this.email,
      this.phone,
      this.avatar,
      status,
      this.isOnline,
      this.lastSeen,
      this.createdAt,
      new Date(),
    );
  }

  setOnline(isOnline: boolean): User {
    return new User(
      this.id,
      this.username,
      this.email,
      this.phone,
      this.avatar,
      this.status,
      isOnline,
      new Date(),
      this.createdAt,
      new Date(),
    );
  }
}
