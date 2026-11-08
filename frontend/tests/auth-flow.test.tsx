import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { MemoryRouter } from "react-router";
import App from "../src/App";

type Handler = (init: RequestInit) => { status: number; body?: unknown };

/** "METHOD /path" 별로 응답을 정하는 fetch mock */
function mockApi(routes: Record<string, Handler>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const key = `${init.method ?? "GET"} ${String(input)}`;
    const handler = routes[key];
    if (!handler) throw new Error(`mock 없음: ${key}`);
    const { status, body } = handler(init);
    return new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

const TOKEN = "test-token";
const user = { id: "u1", email: "new@example.com", createdAt: "2026-11-08T00:00:00.000Z" };

describe("회원가입 → 대시보드", () => {
  test("/register 로 들어오면 회원가입 폼을 보여준다.", () => {
    renderAt("/register");
    expect(screen.getByLabelText("비밀번호 확인")).toHaveAttribute("name", "confirmPassword");
  });

  test("회원가입에 성공하면 토큰을 저장하고 대시보드로 이동한다.", async () => {
    const fetchMock = mockApi({
      "POST /api/auth/register": () => ({ status: 201, body: { token: TOKEN, user } }),
      "GET /api/tasks": () => ({ status: 200, body: [] }),
    });
    renderAt("/register");
    fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText("비밀번호"), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText("비밀번호 확인"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "회원가입" }));

    expect(await screen.findByRole("heading", { level: 1, name: "대시보드" })).toBeInTheDocument();
    expect(localStorage.getItem("taskflow.token")).toBe(TOKEN);
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(init?.body))).toEqual({
      email: "new@example.com",
      password: "password123",
    });
  });

  test("이미 가입된 이메일이면 에러를 보여준다.", async () => {
    mockApi({
      "POST /api/auth/register": () => ({ status: 409, body: { error: "Email already registered" } }),
    });
    renderAt("/register");
    fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText("비밀번호"), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText("비밀번호 확인"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "회원가입" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("이미 가입된 이메일입니다.");
  });
});

describe("로그인", () => {
  test("잘못된 자격증명이면 .error-message 로 에러를 보여주고 /login 에 머문다.", async () => {
    mockApi({
      "POST /api/auth/login": () => ({ status: 401, body: { error: "Invalid credentials" } }),
    });
    renderAt("/login");
    fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("비밀번호"), { target: { value: "wrongpassword" } });
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("잘못된 이메일 또는 비밀번호 입니다.");
    expect(alert).toHaveClass("error-message");
    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();
  });

  test("로그인에 성공하면 대시보드로 이동한다.", async () => {
    mockApi({
      "POST /api/auth/login": () => ({ status: 200, body: { token: TOKEN, user } }),
      "GET /api/tasks": () => ({ status: 200, body: [] }),
    });
    renderAt("/login");
    fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText("비밀번호"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    expect(await screen.findByRole("heading", { level: 1, name: "대시보드" })).toBeInTheDocument();
  });

  test("서버에 연결할 수 없으면 안내 메시지를 보여준다.", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
    renderAt("/login");
    fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText("비밀번호"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("서버에 연결할 수 없습니다.");
  });
});

describe("대시보드", () => {
  test("로그인하지 않았으면 로그인 페이지로 보낸다.", () => {
    renderAt("/dashboard");
    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();
  });

  test("토큰으로 태스크 목록을 불러와 보여준다.", async () => {
    localStorage.setItem("taskflow.token", TOKEN);
    const fetchMock = mockApi({
      "GET /api/tasks": () => ({
        status: 200,
        body: [{ id: "t1", title: "기존 태스크", description: null, status: "pending" }],
      }),
    });
    renderAt("/dashboard");

    expect(await screen.findByText("기존 태스크")).toBeInTheDocument();
    const [, init] = fetchMock.mock.calls[0];
    expect(new Headers(init?.headers).get("Authorization")).toBe(`Bearer ${TOKEN}`);
  });

  test("새 태스크 추가 버튼으로 모달을 열어 태스크를 만들면 목록에 나타난다.", async () => {
    localStorage.setItem("taskflow.token", TOKEN);
    const fetchMock = mockApi({
      "GET /api/tasks": () => ({ status: 200, body: [] }),
      "POST /api/tasks": (init) => ({
        status: 201,
        body: { id: "t2", description: null, status: "pending", ...JSON.parse(String(init.body)) },
      }),
    });
    renderAt("/dashboard");
    // 목록을 불러오는 동안에는 추가 버튼이 비활성화된다.
    expect(screen.getByRole("button", { name: "새 태스크 추가" })).toBeDisabled();
    await screen.findByText("태스크가 없습니다.");

    fireEvent.click(screen.getByRole("button", { name: "새 태스크 추가" }));
    const dialog = screen.getByRole("dialog", { name: "새 태스크" });
    expect(dialog).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("제목"), { target: { value: "장보기" } });
    fireEvent.change(screen.getByLabelText("설명"), { target: { value: "우유" } });
    fireEvent.click(screen.getByRole("button", { name: "추가" }));

    expect(await screen.findByText("장보기")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === "POST");
    expect(JSON.parse(String(postCall?.[1]?.body))).toEqual({ title: "장보기", description: "우유" });
  });

  test("상태 메뉴에서 진행중을 고르면 API 결과대로 반영된다.", async () => {
    localStorage.setItem("taskflow.token", TOKEN);
    mockApi({
      "GET /api/tasks": () => ({
        status: 200,
        body: [{ id: "t1", title: "운동", description: null, status: "pending" }],
      }),
      "PATCH /api/tasks/t1": (init) => ({
        status: 200,
        body: { id: "t1", title: "운동", description: null, ...JSON.parse(String(init.body)) },
      }),
    });
    renderAt("/dashboard");
    await screen.findByText("운동");

    fireEvent.click(screen.getByRole("button", { name: "상태 변경" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "진행중" }));
    expect(await screen.findByTestId("status-in_progress")).toHaveTextContent("진행중");
  });

  test("삭제는 확인 다이얼로그에서 확인해야 실행되고, 취소하면 남아 있다.", async () => {
    localStorage.setItem("taskflow.token", TOKEN);
    const fetchMock = mockApi({
      "GET /api/tasks": () => ({
        status: 200,
        body: [{ id: "t1", title: "운동", description: null, status: "pending" }],
      }),
      "DELETE /api/tasks/t1": () => ({ status: 204 }),
    });
    renderAt("/dashboard");
    await screen.findByText("운동");

    // 취소
    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("운동");
    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === "DELETE")).toBe(false);

    // 확인
    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    fireEvent.click(screen.getByRole("button", { name: "확인" }));
    await waitFor(() => expect(screen.queryByText("운동")).not.toBeInTheDocument());
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  test("토큰이 만료(401)되면 로그아웃하고 로그인 페이지로 보낸다.", async () => {
    localStorage.setItem("taskflow.token", "expired");
    mockApi({
      "GET /api/tasks": () => ({ status: 401, body: { error: "Invalid or expired token" } }),
    });
    renderAt("/dashboard");

    expect(await screen.findByRole("button", { name: "로그인" })).toBeInTheDocument();
    expect(localStorage.getItem("taskflow.token")).toBeNull();
  });

  test("로그아웃하면 토큰을 지우고 홈으로 이동한다.", async () => {
    localStorage.setItem("taskflow.token", TOKEN);
    mockApi({ "GET /api/tasks": () => ({ status: 200, body: [] }) });
    renderAt("/dashboard");
    await screen.findByText("태스크가 없습니다.");

    fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));
    expect(await screen.findByRole("heading", { level: 1, name: "TaskFlow" })).toBeInTheDocument();
    expect(localStorage.getItem("taskflow.token")).toBeNull();
  });
});
