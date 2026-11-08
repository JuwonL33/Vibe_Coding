import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { JWT_SECRET } from "../lib/env";
import { errorResponse } from "../lib/errors";

// 인증 미들웨어를 거친 라우트에서 c.get("userId")로 사용자 id를 꺼낼 수 있다.
export type AuthEnv = {
  Variables: {
    userId: string;
  };
};

// Authorization: Bearer <JWT> 헤더를 검증한다.
// 헤더가 없거나, 형식이 틀리거나, 서명·만료 검증에 실패하면 401을 반환한다.
export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const header = c.req.header("Authorization");
  const match = header?.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return errorResponse(c, 401, "Missing or malformed Authorization header");
  }

  try {
    const payload = await verify(match[1], JWT_SECRET, "HS256");
    if (typeof payload.sub !== "string") {
      return errorResponse(c, 401, "Invalid token");
    }
    c.set("userId", payload.sub);
  } catch {
    return errorResponse(c, 401, "Invalid or expired token");
  }

  await next();
});
