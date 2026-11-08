import { Hono } from "hono";
import auth from "./routes/auth";
import tasks from "./routes/tasks";
import { errorResponse, handleError } from "./lib/errors";

const app = new Hono();

app.route("/api/auth", auth);
app.route("/api/tasks", tasks);

// 404와 처리되지 않은 예외도 동일한 에러 포맷으로 응답한다.
app.notFound((c) => errorResponse(c, 404, "Not Found"));
app.onError(handleError);

export default app;
