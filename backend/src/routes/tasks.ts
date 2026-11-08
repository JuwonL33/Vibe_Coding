import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { tasks, taskStatuses } from "../db/schema";
import { errorResponse, validateJson } from "../lib/errors";
import { requireAuth, type AuthEnv } from "../middleware/auth";

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "title은 필수입니다.").max(200),
  description: z.string().max(2000).optional(),
});

const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    // null을 보내면 설명을 지운다.
    description: z.string().max(2000).nullable().optional(),
    status: z.enum(taskStatuses).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "수정할 필드를 하나 이상 보내야 합니다.",
  });

// 모든 조회/수정/삭제는 "id가 일치하고 + 내 태스크인 것"으로만 찾는다.
// 다른 사람의 태스크는 존재 여부를 드러내지 않도록 403이 아닌 404로 응답한다.
const ownTask = (id: string, userId: string) =>
  and(eq(tasks.id, id), eq(tasks.userId, userId));

const tasksRoute = new Hono<AuthEnv>();

tasksRoute.use("*", requireAuth);

// 목록 조회 (최신순)
tasksRoute.get("/", (c) => {
  const list = db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, c.get("userId")))
    .orderBy(desc(tasks.createdAt))
    .all();
  return c.json(list, 200);
});

// 단건 조회
tasksRoute.get("/:id", (c) => {
  const task = db
    .select()
    .from(tasks)
    .where(ownTask(c.req.param("id"), c.get("userId")))
    .get();
  if (!task) return errorResponse(c, 404, "Task not found");
  return c.json(task, 200);
});

// 생성 (status는 항상 기본값 "pending"으로 시작)
tasksRoute.post("/", validateJson(createTaskSchema), (c) => {
  const { title, description } = c.req.valid("json");
  const task = db
    .insert(tasks)
    .values({ title, description, userId: c.get("userId") })
    .returning()
    .get();
  return c.json(task, 201);
});

// 부분 수정
tasksRoute.patch("/:id", validateJson(updateTaskSchema), (c) => {
  const changes = c.req.valid("json");
  const task = db
    .update(tasks)
    .set(changes)
    .where(ownTask(c.req.param("id"), c.get("userId")))
    .returning()
    .get();
  if (!task) return errorResponse(c, 404, "Task not found");
  return c.json(task, 200);
});

// 삭제
tasksRoute.delete("/:id", (c) => {
  const deleted = db
    .delete(tasks)
    .where(ownTask(c.req.param("id"), c.get("userId")))
    .returning({ id: tasks.id })
    .get();
  if (!deleted) return errorResponse(c, 404, "Task not found");
  return c.body(null, 204);
});

export default tasksRoute;
