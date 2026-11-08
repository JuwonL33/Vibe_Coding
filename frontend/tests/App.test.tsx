import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { MemoryRouter } from "react-router";
import App from "../src/App";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("메인 홈 페이지", () => {
  test("서비스 이름과 회원가입/로그인 링크를 보여준다.", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { level: 1, name: "TaskFlow" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "회원가입" })).toHaveAttribute("href", "/signup");
    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute("href", "/login");
  });

  test("로그인 링크를 누르면 로그인 페이지로 이동한다.", () => {
    renderAt("/");
    fireEvent.click(screen.getByRole("link", { name: "로그인" }));
    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();
  });

  test("회원가입 링크를 누르면 회원가입 페이지로 이동한다.", () => {
    renderAt("/");
    fireEvent.click(screen.getByRole("link", { name: "회원가입" }));
    expect(screen.getByLabelText("비밀번호 확인")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "회원가입" })).toBeInTheDocument();
  });
});

describe("페이지 간 이동", () => {
  test("로그인 페이지에서 회원가입 페이지로 갈 수 있다.", () => {
    renderAt("/login");
    expect(screen.getByRole("link", { name: "회원가입" })).toHaveAttribute("href", "/signup");
  });

  test("회원가입 페이지에서 로그인 페이지로 갈 수 있다.", () => {
    renderAt("/signup");
    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute("href", "/login");
  });

  test("없는 경로는 404 안내와 홈 링크를 보여준다.", () => {
    renderAt("/nope");
    expect(screen.getByText("페이지를 찾을 수 없습니다.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "홈으로" })).toHaveAttribute("href", "/");
  });
});
