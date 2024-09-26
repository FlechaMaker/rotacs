import { Insertable, Selectable, Updateable } from "kysely";

import { UserTable, SessionTable } from "./auth";

export interface Database {
  user: UserTable;
  session: SessionTable;
  line_notify_token: LineNotifyTokenTable;
}

interface LineNotifyTokenTable {
  id: string;
  issued_at?: Date;
  user_id: string;
  token?: string;
}

export type LineNotifyToken = Selectable<LineNotifyTokenTable>;
export type NewLineNotifyToken = Insertable<LineNotifyTokenTable>;
export type LineNotifyTokenUpdate = Updateable<LineNotifyTokenTable>;
