"use server";

export interface DatabaseUserAttributes {
  username: string;
  display_name: string;
  role: UserRole;
}

export interface UserTable {
  id: string;
  username: string;
  password_hash: string;
  display_name: string;
  role: UserRole;
}

export type UserRole = "admin" | "user";

export interface SessionTable {
  id: string;
  user_id: string;
  expires_at: Date;
}
