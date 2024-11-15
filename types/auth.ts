"use server";

import { CheckSide } from "@/types/check";

export interface DatabaseUserAttributes {
  username: string;
  display_name: string;
  role: UserRole;
  pit_side: CheckSide;
  pit_number: number;
}

export interface UserTable {
  id: string;
  username: string;
  password_hash: string;
  display_name: string;
  role: UserRole;
  pit_side: CheckSide;
  pit_number: number;
}

export type UserRole = "admin" | "user";

export interface SessionTable {
  id: string;
  user_id: string;
  expires_at: Date;
}
