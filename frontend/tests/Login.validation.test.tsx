import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import Login from "../src/components/Login";

function fill(email: string, password: string) {
  fireEvent.change(screen.getByLabelText("이메일"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("비밀번호"), {
    target: { value: password },
  });
}

const submit = () => fireEvent.click(screen.getByRole("button", { name: "로그인" }));

describe("Login 폼 검증", () => {
  test("label과 input이 htmlFor/id로 연결된다.", () => {
    render(<Login onLogin={vi.fn()} />);
    const email = screen.getByLabelText("이메일");
    const label = screen.getByText("이메일");
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", email.id);
    expect(email.id).not.toBe("");
  });

  test("빈 값으로 제출하면 필드별 에러를 보여주고 onLogin을 호출하지 않는다.", () => {
    const onLogin = vi.fn();
    render(<Login onLogin={onLogin} />);
    submit();

    expect(onLogin).not.toHaveBeenCalled();
    expect(screen.getByText("이메일을 입력해 주세요.")).toBeInTheDocument();
    expect(screen.getByText("비밀번호를 입력해 주세요.")).toBeInTheDocument();
    expect(screen.getByLabelText("이메일")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("비밀번호")).toHaveAttribute("aria-invalid", "true");
  });

  test("에러 메시지는 aria-describedby로 입력 필드에 연결된다.", () => {
    render(<Login onLogin={vi.fn()} />);
    submit();
    expect(screen.getByLabelText("이메일")).toHaveAccessibleDescription(
      "이메일을 입력해 주세요.",
    );
  });

  test("이메일 형식이 틀리면 에러를 보여준다.", () => {
    const onLogin = vi.fn();
    render(<Login onLogin={onLogin} />);
    fill("not-an-email", "password123");
    submit();

    expect(onLogin).not.toHaveBeenCalled();
    expect(screen.getByText("올바른 이메일 형식이 아닙니다.")).toBeInTheDocument();
  });

  test("비밀번호가 8자 미만이면 에러를 보여준다.", () => {
    const onLogin = vi.fn();
    render(<Login onLogin={onLogin} />);
    fill("test@example.com", "short");
    submit();

    expect(onLogin).not.toHaveBeenCalled();
    expect(screen.getByText("비밀번호는 8자 이상이어야 합니다.")).toBeInTheDocument();
  });

  test("에러가 난 필드를 고치면 해당 에러가 사라진다.", () => {
    render(<Login onLogin={vi.fn()} />);
    submit();
    fireEvent.change(screen.getByLabelText("이메일"), {
      target: { value: "test@example.com" },
    });

    expect(screen.queryByText("이메일을 입력해 주세요.")).not.toBeInTheDocument();
    expect(screen.getByLabelText("이메일")).toHaveAttribute("aria-invalid", "false");
    // 고치지 않은 필드의 에러는 유지된다.
    expect(screen.getByText("비밀번호를 입력해 주세요.")).toBeInTheDocument();
  });

  test("이메일 앞뒤 공백은 제거하고 onLogin에 전달한다.", () => {
    const onLogin = vi.fn();
    render(<Login onLogin={onLogin} />);
    fill("  test@example.com ", "password123");
    submit();
    expect(onLogin).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  test("error prop(서버 에러)은 폼 상단에 alert로 표시된다.", () => {
    render(<Login onLogin={vi.fn()} error="이메일 또는 비밀번호가 올바르지 않습니다." />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "이메일 또는 비밀번호가 올바르지 않습니다.",
    );
  });

  test("isLoading이면 버튼이 비활성화된다.", () => {
    render(<Login onLogin={vi.fn()} isLoading />);
    expect(screen.getByRole("button", { name: "로그인" })).toBeDisabled();
  });
});
