import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// 태스크 상태 값: 대기(생성 시 기본값) → 진행중 → 완료
export const taskStatuses = ["pending", "in_progress", "completed"] as const;
export type TaskStatus = (typeof taskStatuses)[number];

export const users = sqliteTable("users", {
  // 테스트에서 id를 문자열로 다루므로 UUID 문자열을 사용한다.
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  // 회원가입/로그인 시 이메일로 사용자를 찾으므로 중복을 허용하지 않는다.
  email: text("email").notNull().unique(),
  // 평문이 아닌 bcrypt 해시를 저장한다.
  password: text("password").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const tasks = sqliteTable("tasks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: taskStatuses }).notNull().default("pending"),
  // 사용자가 삭제되면 그 사용자의 태스크도 함께 삭제한다.
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
