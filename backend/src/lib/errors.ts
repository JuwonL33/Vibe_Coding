import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";
import type { z } from "zod";

// 모든 에러 응답은 이 형태로 통일한다.
//   { "error": "사람이 읽을 수 있는 메시지", "details"?: 추가 정보 }
export type ErrorResponse = {
  error: string;
  details?: unknown;
};

export function errorResponse(
  c: Context,
  status: ContentfulStatusCode,
  error: string,
  details?: unknown,
) {
  const body: ErrorResponse = details === undefined ? { error } : { error, details };
  return c.json(body, status);
}

// 요청 JSON 본문을 Zod 스키마로 검증하는 미들웨어.
// 실패하면 400과 함께 필드별 오류를 details에 담아 돌려준다.
export function validateJson<T extends z.ZodType>(schema: T) {
  return validator("json", (value, c) => {
    const result = schema.safeParse(value);
    if (!result.success) {
      return errorResponse(
        c,
        400,
        "Validation failed",
        result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      );
    }
    return result.data as z.infer<T>;
  });
}

// app.onError에서 사용: 던져진 예외를 통일된 포맷으로 바꾼다.
export function handleError(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    return errorResponse(c, err.status, err.message || "Request failed");
  }
  console.error(err);
  return errorResponse(c, 500, "Internal Server Error");
}
