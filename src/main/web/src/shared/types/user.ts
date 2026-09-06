export interface User {
  id: string;
  username?: string;
  name?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  avatar?: string;
  profilePicture?: string;
  status?: string;
  about?: string;
  isOnline: boolean;
  lastSeen?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
