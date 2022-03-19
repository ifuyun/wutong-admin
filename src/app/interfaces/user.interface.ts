export interface UserEntity {
  userName?: string;
  userEmail?: string;
  isAdmin?: boolean;
  meta?: Record<string, string>;
}
