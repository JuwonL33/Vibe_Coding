import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import Register from "../src/components/Register";

function fill(email: string, password: string, confirm: string) {
  fireEvent.change(screen.getByLabelText("이메일"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("비밀번호"), { target: { value: password } });
  fireEvent.change(screen.getByLabelText("비밀번호 확인"), {
    target: { value: confirm },
  });
}
const submit = () => fireEvent.click(screen.getByRole("button", { name: "회원가입" }));

describe("Register component", () => {
  test("이메일, 비밀번호, 비밀번호 확인 필드를 렌더링한다.", () => {
    render(<Register onRegister={vi.fn()} />);
    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
    expect(screen.getByLabelText("비밀번호 확인")).toBeInTheDocument();
  });

  test("올바르게 입력하면 onRegister에 이메일과 비밀번호를 전달한다.", () => {
    const onRegister = vi.fn();
    render(<Register onRegister={onRegister} />);
    fill("new@example.com", "password123", "password123");
    submit();
    expect(onRegister).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "password123",
    });
  });

  test("빈 값으로 제출하면 에러를 보여주고 onRegister을 호출하지 않는다.", () => {
    const onRegister = vi.fn();
    render(<Register onRegister={onRegister} />);
    submit();
    expect(onRegister).not.toHaveBeenCalled();
    expect(screen.getByText("이메일을 입력해 주세요.")).toBeInTheDocument();
    expect(screen.getByText("비밀번호를 입력해 주세요.")).toBeInTheDocument();
    expect(screen.getByText("비밀번호를 한 번 더 입력해 주세요.")).toBeInTheDocument();
  });

  test("비밀번호 확인이 다르면 에러를 보여준다.", () => {
    const onRegister = vi.fn();
    render(<Register onRegister={onRegister} />);
    fill("new@example.com", "password123", "password124");
    submit();
    expect(onRegister).not.toHaveBeenCalled();
    expect(screen.getByLabelText("비밀번호 확인")).toHaveAccessibleDescription(
      "비밀번호가 일치하지 않습니다.",
    );
  });

  test("error prop은 alert로 표시된다.", () => {
    render(<Register onRegister={vi.fn()} error="이미 가입된 이메일입니다." />);
    expect(screen.getByRole("alert")).toHaveTextContent("이미 가입된 이메일입니다.");
  });
});
