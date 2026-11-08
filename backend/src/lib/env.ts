// JWT 서명 키. 운영 환경에서는 반드시 JWT_SECRET을 설정해야 한다.
const secret = process.env.JWT_SECRET;

if (!secret && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET 환경 변수가 설정되지 않았습니다.");
}

export const JWT_SECRET = secret ?? "dev-only-insecure-secret";
