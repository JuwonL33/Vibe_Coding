import { Hono } from "hono";
import { sign } from "hono/jwt";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { users, type User } from "../db/schema";
import { JWT_SECRET } from "../lib/env";
import { errorResponse, validateJson } from "../lib/errors";

const BCRYPT_ROUNDS = 10;
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7일

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
  // 테스트가 name을 함께 보내지만 users 테이블에 컬럼이 없어 저장하지 않는다.
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

// 응답에는 비밀번호 해시를 절대 포함하지 않는다.
function toPublicUser(user: User) {
  return { id: user.id, email: user.email, createdAt: user.createdAt };
}

function createToken(user: User) {
  const now = Math.floor(Date.now() / 1000);
  return sign(
    { sub: user.id, email: user.email, iat: now, exp: now + TOKEN_TTL_SECONDS },
    JWT_SECRET,
    "HS256",
  );
}

const auth = new Hono();

auth.post("/register", validateJson(registerSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const existing = db.select().from(users).where(eq(users.email, email)).get();
  if (existing) {
    return errorResponse(c, 409, "Email already registered");
  }

  const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = db.insert(users).values({ email, password: hashed }).returning().get();

  return c.json({ token: await createToken(user), user: toPublicUser(user) }, 201);
});

auth.post("/login", validateJson(loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const user = db.select().from(users).where(eq(users.email, email)).get();
  // 이메일이 없는 경우와 비밀번호가 틀린 경우를 구분하지 않는다(계정 존재 여부 노출 방지).
  const ok = user ? await bcrypt.compare(password, user.password) : false;
  if (!user || !ok) {
    return errorResponse(c, 401, "Invalid credentials");
  }

  return c.json({ token: await createToken(user), user: toPublicUser(user) }, 200);
});

export default auth;
